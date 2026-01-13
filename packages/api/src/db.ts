import { getDbPg } from "@mental/db";

// Lazy initialization - db is created on first access
let _db: ReturnType<typeof getDbPg> | null = null;

export function getDb() {
  if (!_db) {
    _db = getDbPg();
  }
  return _db;
}

// For backwards compatibility with existing code
export const db = {
  get instance() {
    return getDb();
  },
};
