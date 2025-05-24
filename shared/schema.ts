import { pgTable, text, serial, integer, boolean, json, varchar, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
  userId: varchar("user_id").notNull(), // Link to authenticated user
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertArtworkSchema = createInsertSchema(artworks).omit({
  id: true,
  aiAnalysisComplete: true,
  marketplaceListed: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Artwork = typeof artworks.$inferSelect;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for multiple auth providers
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Unique user ID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"), // For email/password auth
  provider: varchar("provider").default("email"), // 'email', 'google', 'facebook', 'replit'
  role: varchar("role", { length: 20 }).default("user"), // 'user' or 'admin'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  artworks: many(artworks),
}));

export const artworksRelations = relations(artworks, ({ one }) => ({
  user: one(users, {
    fields: [artworks.userId],
    references: [users.id],
  }),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
