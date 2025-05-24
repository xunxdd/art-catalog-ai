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
        // Local auth user (email/google/facebook)
        user = req.user;
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

  // Admin analytics routes
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const [userStats, artworkStats, userAnalytics] = await Promise.all([
        storage.getUserStats(),
        storage.getArtworkStats(),
        storage.getUserAnalytics(),
      ]);
      
      res.json({
        userStats,
        artworkStats,
        userAnalytics,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin analytics" });
    }
  });

  // Get all artworks (admin only)
  app.get("/api/artworks", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const artworks = await storage.getAllArtworks();
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artworks" });
    }
  });

  // Get user's own artworks
  app.get("/api/user/artworks", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user?.id || req.user?.claims?.sub;
      const artworks = await storage.getUserArtworks(userId);
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user artworks" });
    }
  });

  // Get recent artworks (samples for new users)
  app.get("/api/artworks/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const artworks = await storage.getRecentArtworks(limit);
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
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const artworks = await storage.searchArtworks(query);
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to search artworks" });
    }
  });

  // Upload and analyze artwork (authenticated users only)
  app.post("/api/artworks/upload", async (req: MulterRequest & any, res) => {
    // Check authentication BEFORE multer processing
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Now handle the file upload
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Process image with Sharp
      const imageBuffer = req.file.buffer;
      
      // Create thumbnail
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Convert main image to base64 for AI analysis
      const base64Image = imageBuffer.toString('base64');
      
      // Create placeholder URLs (in production, you'd upload to cloud storage)
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;
      const thumbnailUrl = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;

      // Create initial artwork record - handle both auth types
      const userId = req.user?.id || req.user?.claims?.sub;
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

      // Start AI analysis in background
      analyzeArtworkImage(base64Image)
        .then(async (analysis) => {
          const tags = [
            ...analysis.style,
            ...analysis.themes,
            ...analysis.colors
          ].filter(Boolean);

          await storage.updateArtwork(initialArtwork.id, {
            title: analysis.title,
            artist: analysis.artist,
            medium: analysis.medium,
            year: analysis.estimatedYear,
            condition: analysis.condition,
            description: analysis.description,
            suggestedPrice: Math.round(analysis.suggestedPrice * 100), // convert to cents
            tags,
            aiAnalysisComplete: true,
            analysisData: analysis,
          });
        })
        .catch(async (error) => {
          console.error("AI analysis failed:", error);
          await storage.updateArtwork(initialArtwork.id, {
            title: "Analysis Failed",
            description: error.message.includes('quota') 
              ? "OpenAI quota exceeded - please check billing" 
              : "AI analysis failed - please try again",
            aiAnalysisComplete: false,
          });
        });

      res.json(initialArtwork);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload artwork" });
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

  // Delete artwork
  app.delete("/api/artworks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteArtwork(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      
      res.json({ message: "Artwork deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete artwork" });
    }
  });

  // Re-analyze artwork
  app.post("/api/artworks/:id/analyze", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      if (!artwork.imageUrl) {
        return res.status(400).json({ message: "No image available for analysis" });
      }

      // Extract base64 from data URL
      const base64Match = artwork.imageUrl.match(/^data:image\/[a-zA-Z]+;base64,(.+)$/);
      if (!base64Match) {
        return res.status(400).json({ message: "Invalid image format" });
      }

      const base64Image = base64Match[1];
      
      try {
        const analysis = await analyzeArtworkImage(base64Image);
        
        const updatedArtwork = await storage.updateArtwork(id, {
          title: analysis.title,
          artist: analysis.artist || undefined,
          medium: analysis.medium,
          description: analysis.description,
          tags: [...analysis.style, ...analysis.themes, ...analysis.colors],
          suggestedPrice: Math.round(analysis.suggestedPrice * 100), // Convert to cents
          analysisData: analysis,
          aiAnalysisComplete: true,
        });

        res.json(updatedArtwork);
      } catch (error) {
        console.error("AI analysis failed:", error);
        const updatedArtwork = await storage.updateArtwork(id, {
          title: "Analysis Failed",
          description: error.message.includes('quota') 
            ? "OpenAI quota exceeded - please check billing" 
            : "AI analysis failed - please try again",
          aiAnalysisComplete: false,
        });
        res.json(updatedArtwork);
      }
    } catch (error) {
      console.error("Re-analyze error:", error);
      res.status(500).json({ message: "Failed to re-analyze artwork" });
    }
  });

  // Generate new description for artwork
  app.post("/api/artworks/:id/description", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      const newDescription = await generateArtworkDescription({
        title: artwork.title,
        medium: artwork.medium || undefined,
        style: artwork.tags?.filter(tag => 
          tag.includes('ism') || tag.includes('Style') || tag.includes('Movement')
        ),
        themes: artwork.tags?.filter(tag => 
          !tag.includes('ism') && !tag.includes('Style')
        ),
        colors: artwork.tags?.filter(tag =>
          ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gold', 'silver'].some(color =>
            tag.toLowerCase().includes(color)
          )
        ),
      });

      const updatedArtwork = await storage.updateArtwork(id, {
        description: newDescription
      });

      res.json({ description: newDescription });
    } catch (error) {
      console.error("Description generation error:", error);
      res.status(500).json({ message: "Failed to generate description" });
    }
  });

  // Re-analyze artwork
  app.post("/api/artworks/:id/analyze", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      // Update to analyzing state
      await storage.updateArtwork(id, {
        title: "Re-analyzing...",
        aiAnalysisComplete: false,
      });

      // Extract base64 from data URL
      const base64Match = artwork.imageUrl.match(/^data:image\/[a-zA-Z]+;base64,(.+)$/);
      if (!base64Match) {
        return res.status(400).json({ message: "Invalid image format" });
      }
      
      const base64Image = base64Match[1];

      // Start AI analysis
      analyzeArtworkImage(base64Image)
        .then(async (analysis) => {
          const tags = [
            ...analysis.style,
            ...analysis.themes,
            ...analysis.colors
          ].filter(Boolean);

          await storage.updateArtwork(id, {
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
        })
        .catch(async (error) => {
          console.error("Re-analysis failed:", error);
          await storage.updateArtwork(id, {
            title: "Re-analysis Failed",
            description: error.message.includes('quota') 
              ? "OpenAI quota exceeded - please check billing" 
              : "AI analysis failed - please try again",
            aiAnalysisComplete: false,
          });
        });

      res.json({ message: "Re-analysis started" });
    } catch (error) {
      console.error("Re-analysis error:", error);
      res.status(500).json({ message: "Failed to start re-analysis" });
    }
  });

  // Get suggested price for artwork
  app.post("/api/artworks/:id/price", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      const suggestedPrice = await suggestArtworkPrice({
        medium: artwork.medium || undefined,
        style: artwork.tags?.filter(tag => 
          tag.includes('ism') || tag.includes('Style')
        ),
        dimensions: artwork.dimensions || undefined,
        artist: artwork.artist || undefined,
        condition: artwork.condition || undefined,
      });

      const updatedArtwork = await storage.updateArtwork(id, {
        suggestedPrice: Math.round(suggestedPrice * 100) // convert to cents
      });

      res.json({ suggestedPrice: Math.round(suggestedPrice * 100) });
    } catch (error) {
      console.error("Price suggestion error:", error);
      res.status(500).json({ message: "Failed to suggest price" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
