import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
export type DbClient = ReturnType<typeof drizzle<typeof schema>>;
/**
 * Create a database client
 * @param dbPath Path to SQLite database file (defaults to ./mental.db)
 * @returns Drizzle database client with typed schema
 */
export declare function getDb(dbPath?: string): DbClient;
//# sourceMappingURL=client.d.ts.map