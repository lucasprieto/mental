"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentalItems = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
/**
 * Mental items table - stores captured thoughts from sessions
 */
exports.mentalItems = (0, sqlite_core_1.sqliteTable)("mental_items", {
    /** Unique identifier (cuid) */
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    /** Brief title/summary of the thought */
    title: (0, sqlite_core_1.text)("title").notNull(),
    /** Full content of the captured thought */
    content: (0, sqlite_core_1.text)("content").notNull(),
    /** User-assigned tags (stored as JSON string array) */
    tags: (0, sqlite_core_1.text)("tags").notNull().default("[]"),
    /** Auto-extracted theme from the prompt context */
    theme: (0, sqlite_core_1.text)("theme"),
    /** Current status: 'open' or 'resolved' */
    status: (0, sqlite_core_1.text)("status").notNull().default("open"),
    /** Summary of how the item was resolved */
    resolution: (0, sqlite_core_1.text)("resolution"),
    /** Links item to a specific session for tracking */
    sessionId: (0, sqlite_core_1.text)("session_id"),
    /** Unix timestamp when created */
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull(),
    /** Unix timestamp when last updated */
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull(),
    /** Unix timestamp when resolved (nullable) */
    resolvedAt: (0, sqlite_core_1.integer)("resolved_at", { mode: "timestamp" }),
});
//# sourceMappingURL=schema.js.map