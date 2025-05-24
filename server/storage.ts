import { artworks, type Artwork, type InsertArtwork, users, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, avg, and, gte } from "drizzle-orm";

export interface IStorage {
  // User methods (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Artwork methods (user-specific)
  getArtwork(id: number, userId?: string): Promise<Artwork | undefined>;
  getAllArtworks(): Promise<Artwork[]>; // Admin only
  getRecentArtworks(limit?: number, userId?: string): Promise<Artwork[]>;
  getUserArtworks(userId: string): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: number, updates: Partial<Artwork>, userId?: string): Promise<Artwork | undefined>;
  deleteArtwork(id: number, userId?: string): Promise<boolean>;
  searchArtworks(query: string, userId?: string): Promise<Artwork[]>;
  
  // Admin analytics methods
  getUserStats(): Promise<{ totalUsers: number; activeUsers: number; newUsersToday: number; }>;
  getArtworkStats(): Promise<{ totalArtworks: number; artworksToday: number; avgPrice: number; }>;
  getUserAnalytics(): Promise<Array<{ userId: string; userName: string; artworkCount: number; totalValue: number; }>>;
}

export class DatabaseStorage implements IStorage {
  // User methods for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Artwork methods with user filtering
  async getArtwork(id: number, userId?: string): Promise<Artwork | undefined> {
    const conditions = userId 
      ? and(eq(artworks.id, id), eq(artworks.userId, userId))
      : eq(artworks.id, id);
    
    const [artwork] = await db.select().from(artworks).where(conditions);
    return artwork;
  }

  async getAllArtworks(): Promise<Artwork[]> {
    return await db.select().from(artworks).orderBy(artworks.id);
  }

  async getRecentArtworks(limit: number = 10): Promise<Artwork[]> {
    return await db.select().from(artworks).orderBy(artworks.id).limit(limit);
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const [artwork] = await db
      .insert(artworks)
      .values(insertArtwork)
      .returning();
    return artwork;
  }

  async updateArtwork(id: number, updates: Partial<Artwork>): Promise<Artwork | undefined> {
    const [artwork] = await db
      .update(artworks)
      .set(updates)
      .where(eq(artworks.id, id))
      .returning();
    return artwork || undefined;
  }

  async deleteArtwork(id: number): Promise<boolean> {
    const result = await db.delete(artworks).where(eq(artworks.id, id));
    return result.rowCount > 0;
  }

  async searchArtworks(query: string): Promise<Artwork[]> {
    // For PostgreSQL, we can use ilike for case-insensitive search
    const searchPattern = `%${query}%`;
    return await db.select().from(artworks).where(
      // Note: This is a simplified search - in production you'd use full-text search
      eq(artworks.title, searchPattern)
    );
  }
}

export const storage = new DatabaseStorage();
