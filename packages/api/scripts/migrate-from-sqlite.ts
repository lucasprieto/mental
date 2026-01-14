/**
 * One-time migration script: SQLite → Neon Postgres
 *
 * Reads all items from local SQLite database and inserts them
 * directly into Neon Postgres, preserving original IDs.
 *
 * Usage:
 *   DATABASE_URL="..." pnpm migrate
 */

import Database from "better-sqlite3";
import { getDbPg, pg } from "@mental/db";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface SQLiteItem {
  id: string;
  title: string;
  content: string;
  tags: string;
  theme: string | null;
  status: string;
  resolution: string | null;
  session_id: string | null;
  created_at: number;
  updated_at: number;
  resolved_at: number | null;
}

async function migrate() {
  // Path to SQLite database
  const sqlitePath =
    process.env.SQLITE_PATH ||
    path.join(__dirname, "..", "..", "mcp-server", "mental.db");

  console.log(`Reading from SQLite: ${sqlitePath}`);

  // Open SQLite
  const sqlite = new Database(sqlitePath);

  // Get all items from SQLite
  const items = sqlite.prepare("SELECT * FROM mental_items").all() as SQLiteItem[];

  console.log(`Found ${items.length} items in SQLite`);

  if (items.length === 0) {
    console.log("No items to migrate");
    sqlite.close();
    return;
  }

  // Connect to Neon
  const db = getDbPg();

  console.log("Connected to Neon Postgres");

  // Migrate each item
  let migrated = 0;
  let skipped = 0;

  for (const item of items) {
    try {
      // Convert timestamps to Date objects
      // Handle both milliseconds (>10^12) and seconds (<10^12) formats
      const toDate = (ts: number): Date => {
        // If timestamp is larger than year 2100 in seconds, it's milliseconds
        if (ts > 4102444800) {
          return new Date(ts); // Already milliseconds
        }
        return new Date(ts * 1000); // Convert seconds to milliseconds
      };

      const createdAt = toDate(item.created_at);
      const updatedAt = toDate(item.updated_at);
      const resolvedAt = item.resolved_at ? toDate(item.resolved_at) : null;

      // Insert into Neon with original ID
      await db.insert(pg.mentalItems).values({
        id: item.id,
        title: item.title,
        content: item.content,
        tags: item.tags, // Already a JSON string
        theme: item.theme,
        status: item.status,
        resolution: item.resolution,
        sessionId: item.session_id,
        createdAt,
        updatedAt,
        resolvedAt,
      });

      migrated++;
      console.log(`  ✓ Migrated: ${item.id} - ${item.title.slice(0, 50)}`);
    } catch (error: unknown) {
      // Handle duplicate key errors gracefully (for idempotency)
      if (
        error instanceof Error &&
        error.message.includes("duplicate key")
      ) {
        skipped++;
        console.log(`  - Skipped (already exists): ${item.id}`);
      } else {
        throw error;
      }
    }
  }

  sqlite.close();

  console.log(`\nMigration complete:`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Skipped (duplicates): ${skipped}`);
  console.log(`  Total in SQLite: ${items.length}`);
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
