import { pgTable, text, timestamp, index, customType } from "drizzle-orm/pg-core";
import { SQL, sql } from "drizzle-orm";

/**
 * Custom type for PostgreSQL tsvector (full-text search)
 */
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

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

  /** Generated tsvector for full-text search (auto-maintained) */
  search: tsvector("search").generatedAlwaysAs(
    (): SQL =>
      sql`setweight(to_tsvector('english', ${mentalItems.title}), 'A') ||
          setweight(to_tsvector('english', ${mentalItems.content}), 'B')`
  ),
}, (t) => [
  index("idx_mental_items_search").using("gin", t.search),
]);

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

/**
 * Users table - stores user information linked to Auth0
 */
export const users = pgTable("users", {
  /** Unique identifier (Auth0 sub claim) */
  id: text("id").primaryKey(),

  /** User email from Auth0 */
  email: text("email").notNull(),

  /** User display name (optional) */
  name: text("name"),

  /** Timestamp when created */
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),

  /** Timestamp when last updated */
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/** Type for selecting a user (Postgres) */
export type UserRowPg = typeof users.$inferSelect;

/** Type for inserting a user (Postgres) */
export type NewUserRowPg = typeof users.$inferInsert;

/**
 * API Keys table - stores hashed API keys for MCP server authentication
 */
export const apiKeys = pgTable("api_keys", {
  /** Unique identifier (cuid) */
  id: text("id").primaryKey(),

  /** Foreign key to users.id (no FK constraint yet - will add after migration) */
  userId: text("user_id").notNull(),

  /** SHA-256 hash of the raw API key */
  keyHash: text("key_hash").notNull().unique(),

  /** User-assigned name for the key */
  name: text("name").notNull().default("Default Key"),

  /** Timestamp when key was last used */
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),

  /** Timestamp when created */
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/** Type for selecting an API key (Postgres) */
export type ApiKeyRowPg = typeof apiKeys.$inferSelect;

/** Type for inserting an API key (Postgres) */
export type NewApiKeyRowPg = typeof apiKeys.$inferInsert;
