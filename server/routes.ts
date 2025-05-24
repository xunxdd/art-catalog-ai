import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArtworkSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { setupLocalAuth } from "./localAuth";
import { analyzeArtworkImage, generateArtworkDescription, suggestArtworkPrice } from "./openai";
import multer from "multer";
import sharp from "sharp";
import { z } from "zod";
import type { Request } from "express";

// Extend Request type to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup local authentication first (includes session setup)
  setupLocalAuth(app);   // Email/Google/Facebook Auth
  // Note: Replit Auth disabled during development to avoid session conflicts

  // Auth routes - Handle both Replit Auth and local auth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      let userId;
      let user;

      // Check if it's Replit Auth (has claims) or local auth (direct user object)
      if (req.user?.claims?.sub) {
        // Replit Auth user
        userId = req.user.claims.sub;
        user = await storage.getUser(userId);
      } else if (req.user?.id) {
        // Local Auth user
        userId = req.user.id;
        user = req.user;
      } else {
        return res.status(401).json({ message: "Invalid user session" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user's artworks
  app.get("/api/user/artworks", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      let userId;
      if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else if (req.user?.id) {
        userId = req.user.id;
      } else {
        return res.status(401).json({ message: "Invalid user session" });
      }

      const artworks = await storage.getUserArtworks(userId);
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user artworks" });
    }
  });

  // Get recent artworks (sample data for unauthenticated users)
  app.get("/api/artworks/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Get user ID if authenticated
      let userId;
      if (req.isAuthenticated && req.isAuthenticated()) {
        if (req.user?.claims?.sub) {
          userId = req.user.claims.sub;
        } else if (req.user?.id) {
          userId = req.user.id;
        }
      }
      
      const artworks = await storage.getRecentArtworks(limit, userId);
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent artworks" });
    }
  });

  // Get single artwork
  app.get("/api/artworks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artwork" });
    }
  });

  // Search artworks
  app.get("/api/artworks/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const artworks = await storage.searchArtworks(query);
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to search artworks" });
    }
  });

  // Test auth endpoint
  app.get("/api/test-auth", (req: any, res) => {
    console.log('=== AUTH TEST ===');
    console.log('Session ID:', req.sessionID);
    console.log('Session exists:', !!req.session);
    console.log('User exists:', !!req.user);
    console.log('isAuthenticated exists:', typeof req.isAuthenticated);
    console.log('isAuthenticated result:', req.isAuthenticated?.());
    console.log('User object:', req.user);
    console.log('=================');
    
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated", debug: {
        hasIsAuth: !!req.isAuthenticated,
        isAuthResult: req.isAuthenticated?.(),
        hasUser: !!req.user
      }});
    }
    
    res.json({ message: "Authenticated!", user: req.user });
  });

  // Upload and analyze artwork (authenticated users only)
  app.post("/api/artworks/upload", upload.single('image'), async (req: MulterRequest & any, res) => {
    try {
      // Use exact same auth check as /api/auth/user endpoint
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      let userId;
      if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else if (req.user?.id) {
        userId = req.user.id;  
      } else {
        return res.status(401).json({ message: "Invalid user session" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Process and create artwork with AI analysis
      const imageBuffer = req.file.buffer;
      const thumbnailBuffer = await sharp(imageBuffer).resize(400, 400, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;
      const thumbnailUrl = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;

      const initialArtwork = await storage.createArtwork({
        title: "Analyzing...",
        imageUrl,
        thumbnailUrl,
        medium: "",
        description: "",
        tags: [],
        suggestedPrice: 0,
        analysisData: null,
        userId,
      });

      // Background AI analysis with detailed error logging
      console.log("Starting AI analysis for artwork ID:", initialArtwork.id);
      analyzeArtworkImage(base64Image).then(async (analysis) => {
        console.log("AI analysis successful:", analysis);
        const tags = [...analysis.style, ...analysis.themes, ...analysis.colors].filter(Boolean);
        await storage.updateArtwork(initialArtwork.id, {
          title: analysis.title,
          artist: analysis.artist,
          medium: analysis.medium,
          year: analysis.estimatedYear,
          condition: analysis.condition,
          description: analysis.description,
          suggestedPrice: Math.round(analysis.suggestedPrice * 100),
          tags,
          aiAnalysisComplete: true,
          analysisData: analysis,
        });
        console.log("Artwork updated with AI analysis");
      }).catch(async (error) => {
        console.error("AI analysis failed with error:", error);
        console.error("Error details:", error.message);
        await storage.updateArtwork(initialArtwork.id, {
          title: "Analysis Failed",
          description: "AI analysis could not be completed for this artwork.",
          aiAnalysisComplete: false,
        });
      });

      res.status(201).json({ 
        id: initialArtwork.id,
        title: initialArtwork.title,
        imageUrl: initialArtwork.imageUrl 
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload and analyze artwork" });
    }
  });

  // Update artwork
  app.patch("/api/artworks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Validate updates against schema
      const validatedUpdates = insertArtworkSchema.partial().parse(updates);
      
      const artwork = await storage.updateArtwork(id, validatedUpdates);
      
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      
      res.json(artwork);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update artwork" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}