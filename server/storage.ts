import { artworks, type Artwork, type InsertArtwork, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Artwork methods
  getArtwork(id: number): Promise<Artwork | undefined>;
  getAllArtworks(): Promise<Artwork[]>;
  getRecentArtworks(limit?: number): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: number, updates: Partial<Artwork>): Promise<Artwork | undefined>;
  deleteArtwork(id: number): Promise<boolean>;
  searchArtworks(query: string): Promise<Artwork[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private artworks: Map<number, Artwork>;
  private currentUserId: number;
  private currentArtworkId: number;

  constructor() {
    this.users = new Map();
    this.artworks = new Map();
    this.currentUserId = 1;
    this.currentArtworkId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Artwork methods
  async getArtwork(id: number): Promise<Artwork | undefined> {
    return this.artworks.get(id);
  }

  async getAllArtworks(): Promise<Artwork[]> {
    return Array.from(this.artworks.values()).sort((a, b) => b.id - a.id);
  }

  async getRecentArtworks(limit: number = 10): Promise<Artwork[]> {
    const allArtworks = await this.getAllArtworks();
    return allArtworks.slice(0, limit);
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const id = this.currentArtworkId++;
    const artwork: Artwork = {
      id,
      title: insertArtwork.title,
      artist: insertArtwork.artist || null,
      medium: insertArtwork.medium || null,
      dimensions: insertArtwork.dimensions || null,
      year: insertArtwork.year || null,
      condition: insertArtwork.condition || null,
      suggestedPrice: insertArtwork.suggestedPrice || null,
      description: insertArtwork.description || null,
      tags: insertArtwork.tags || [],
      imageUrl: insertArtwork.imageUrl,
      thumbnailUrl: insertArtwork.thumbnailUrl || null,
      aiAnalysisComplete: false,
      marketplaceListed: false,
      analysisData: insertArtwork.analysisData || null,
    };
    this.artworks.set(id, artwork);
    return artwork;
  }

  async updateArtwork(id: number, updates: Partial<Artwork>): Promise<Artwork | undefined> {
    const existing = this.artworks.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.artworks.set(id, updated);
    return updated;
  }

  async deleteArtwork(id: number): Promise<boolean> {
    return this.artworks.delete(id);
  }

  async searchArtworks(query: string): Promise<Artwork[]> {
    const allArtworks = await this.getAllArtworks();
    const lowercaseQuery = query.toLowerCase();
    
    return allArtworks.filter(artwork => 
      artwork.title.toLowerCase().includes(lowercaseQuery) ||
      artwork.artist?.toLowerCase().includes(lowercaseQuery) ||
      artwork.medium?.toLowerCase().includes(lowercaseQuery) ||
      artwork.description?.toLowerCase().includes(lowercaseQuery) ||
      artwork.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

export const storage = new MemStorage();
