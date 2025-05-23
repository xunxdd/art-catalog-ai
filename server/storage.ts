import { artworks, type Artwork, type InsertArtwork, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getArtwork(id: number): Promise<Artwork | undefined> {
    const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));
    return artwork || undefined;
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
