import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Mental items table - stores captured thoughts from sessions
 */
export const mentalItems = sqliteTable("mental_items", {
  /** Unique identifier (cuid) */
  id: text("id").primaryKey(),

  /** Brief title/summary of the thought */
  title: text("title").notNull(),

  /** Full content of the captured thought */
  content: text("content").notNull(),

  /** User-assigned tags (stored as JSON string array) */
  tags: text("tags").notNull().default("[]"),

  /** Auto-extracted theme from the prompt context */
  theme: text("theme"),

  /** Current status: 'open' or 'resolved' */
  status: text("status").notNull().default("open"),

  /** Summary of how the item was resolved */
  resolution: text("resolution"),

  /** Links item to a specific session for tracking */
  sessionId: text("session_id"),

  /** Unix timestamp when created */
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),

  /** Unix timestamp when last updated */
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

  /** Unix timestamp when resolved (nullable) */
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
});

/** Type for selecting a mental item */
export type MentalItemRow = typeof mentalItems.$inferSelect;

/** Type for inserting a mental item */
export type NewMentalItemRow = typeof mentalItems.$inferInsert;
