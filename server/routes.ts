import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArtworkSchema } from "@shared/schema";
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
  
  // Get all artworks
  app.get("/api/artworks", async (req, res) => {
    try {
      const artworks = await storage.getAllArtworks();
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artworks" });
    }
  });

  // Get recent artworks
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

  // Upload and analyze artwork
  app.post("/api/artworks/upload", upload.single('image'), async (req: MulterRequest, res) => {
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

      // Create initial artwork record
      const initialArtwork = await storage.createArtwork({
        title: "Analyzing...",
        imageUrl,
        thumbnailUrl,
        medium: "",
        description: "",
        tags: [],
        suggestedPrice: 0,
        analysisData: null,
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
