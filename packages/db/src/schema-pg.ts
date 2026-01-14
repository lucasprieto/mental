import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Mental items table (Postgres version) - stores captured thoughts from sessions
 */
export const mentalItems = pgTable("mental_items", {
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

  /** Project/repo name for context */
  project: text("project"),

  /** Timestamp when created */
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),

  /** Timestamp when last updated */
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),

  /** Timestamp when resolved (nullable) */
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
});

/** Type for selecting a mental item (Postgres) */
export type MentalItemRowPg = typeof mentalItems.$inferSelect;

/** Type for inserting a mental item (Postgres) */
export type NewMentalItemRowPg = typeof mentalItems.$inferInsert;

/**
 * Follow-ups table - thread-like updates appended to existing thoughts
 */
export const followUps = pgTable("follow_ups", {
  /** Unique identifier (cuid) */
  id: text("id").primaryKey(),

  /** Foreign key to mental_items.id */
  itemId: text("item_id").notNull(),

  /** The follow-up content */
  content: text("content").notNull(),

  /** Timestamp when created */
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

/** Type for selecting a follow-up (Postgres) */
export type FollowUpRowPg = typeof followUps.$inferSelect;

/** Type for inserting a follow-up (Postgres) */
export type NewFollowUpRowPg = typeof followUps.$inferInsert;
