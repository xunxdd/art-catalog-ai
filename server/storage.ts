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
    return await db.select().from(artworks).orderBy(desc(artworks.createdAt));
  }

  async getRecentArtworks(limit: number = 10, userId?: string): Promise<Artwork[]> {
    const conditions = userId ? eq(artworks.userId, userId) : undefined;
    
    return await db
      .select()
      .from(artworks)
      .where(conditions)
      .orderBy(desc(artworks.createdAt))
      .limit(limit);
  }

  async getUserArtworks(userId: string): Promise<Artwork[]> {
    return await db
      .select()
      .from(artworks)
      .where(eq(artworks.userId, userId))
      .orderBy(desc(artworks.createdAt));
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const [artwork] = await db
      .insert(artworks)
      .values(insertArtwork)
      .returning();
    return artwork;
  }

  async updateArtwork(id: number, updates: Partial<Artwork>, userId?: string): Promise<Artwork | undefined> {
    const conditions = userId 
      ? and(eq(artworks.id, id), eq(artworks.userId, userId))
      : eq(artworks.id, id);

    const [artwork] = await db
      .update(artworks)
      .set({ ...updates, updatedAt: new Date() })
      .where(conditions)
      .returning();
    return artwork;
  }

  async deleteArtwork(id: number, userId?: string): Promise<boolean> {
    const conditions = userId 
      ? and(eq(artworks.id, id), eq(artworks.userId, userId))
      : eq(artworks.id, id);

    const result = await db
      .delete(artworks)
      .where(conditions);
    return (result.rowCount || 0) > 0;
  }

  async searchArtworks(query: string, userId?: string): Promise<Artwork[]> {
    const baseConditions = userId ? eq(artworks.userId, userId) : undefined;
    
    return await db
      .select()
      .from(artworks)
      .where(baseConditions)
      .orderBy(desc(artworks.createdAt));
  }

  // Admin analytics methods
  async getUserStats(): Promise<{ totalUsers: number; activeUsers: number; newUsersToday: number; }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalResult] = await db.select({ count: count() }).from(users);
    const [newTodayResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, today));

    return {
      totalUsers: totalResult.count,
      activeUsers: totalResult.count,
      newUsersToday: newTodayResult.count,
    };
  }

  async getArtworkStats(): Promise<{ totalArtworks: number; artworksToday: number; avgPrice: number; }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalResult] = await db.select({ count: count() }).from(artworks);
    const [todayResult] = await db
      .select({ count: count() })
      .from(artworks)
      .where(gte(artworks.createdAt, today));
    const [avgResult] = await db
      .select({ avg: avg(artworks.suggestedPrice) })
      .from(artworks)
      .where(eq(artworks.aiAnalysisComplete, true));

    return {
      totalArtworks: totalResult.count,
      artworksToday: todayResult.count,
      avgPrice: Math.round(Number(avgResult.avg) || 0),
    };
  }

  async getUserAnalytics(): Promise<Array<{ userId: string; userName: string; artworkCount: number; totalValue: number; }>> {
    const results = await db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        artworkCount: count(artworks.id),
        totalValue: avg(artworks.suggestedPrice),
      })
      .from(users)
      .leftJoin(artworks, eq(users.id, artworks.userId))
      .groupBy(users.id, users.firstName, users.lastName, users.email);

    return results.map(result => ({
      userId: result.userId,
      userName: `${result.firstName || ''} ${result.lastName || ''}`.trim() || result.email || 'Unknown User',
      artworkCount: result.artworkCount,
      totalValue: Math.round(Number(result.totalValue) || 0),
    }));
  }
}

export const storage = new DatabaseStorage();
