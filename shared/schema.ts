import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist"),
  medium: text("medium"),
  dimensions: text("dimensions"),
  year: text("year"),
  condition: text("condition"),
  suggestedPrice: integer("suggested_price"), // price in cents
  description: text("description"),
  tags: text("tags").array(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  aiAnalysisComplete: boolean("ai_analysis_complete").default(false),
  marketplaceListed: boolean("marketplace_listed").default(false),
  analysisData: json("analysis_data"), // stores raw AI analysis results
});

export const insertArtworkSchema = createInsertSchema(artworks).omit({
  id: true,
  aiAnalysisComplete: true,
  marketplaceListed: true,
});

export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Artwork = typeof artworks.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
