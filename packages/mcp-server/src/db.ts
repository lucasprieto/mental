import { getDb, type DbClient } from "@mental/db";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Store database in the mcp-server package directory for now
// Can be made configurable via environment variable later
const DB_PATH = process.env.MENTAL_DB_PATH || path.join(__dirname, "..", "mental.db");

let db: DbClient | null = null;

export function getDatabase(): DbClient {
  if (!db) {
    console.error(`[mental-mcp] Initializing database at: ${DB_PATH}`);
    db = getDb(DB_PATH);
  }
  return db;
}
