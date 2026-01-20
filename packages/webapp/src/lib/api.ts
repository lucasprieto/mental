// Simple fetch-based API client (no Hono RPC - avoids workspace dependency issues in Vercel)

const API_URL = process.env.MENTAL_API_URL || "http://localhost:3000";

let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    console.log(`[mental-webapp] Connecting to API: ${API_URL}`);
    initialized = true;
  }
}

// Item type matching API response
export interface ApiItem {
  id: string;
  title: string;
  content: string;
  theme: string | null;
  status: string;
  resolution: string | null;
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export async function fetchItems(status: string = "all", limit: number = 100): Promise<ApiItem[]> {
  ensureInitialized();
  const res = await fetch(`${API_URL}/items?status=${status}&limit=${limit}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchItem(id: string): Promise<ApiItem | null> {
  ensureInitialized();
  const res = await fetch(`${API_URL}/items/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  if ("error" in data) return null;
  return data;
}

export async function searchItems(query: string): Promise<ApiItem[]> {
  ensureInitialized();
  const res = await fetch(`${API_URL}/items/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function updateItem(id: string, data: Partial<ApiItem>): Promise<ApiItem | null> {
  ensureInitialized();
  const res = await fetch(`${API_URL}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function resolveItem(id: string, resolution: string): Promise<ApiItem | null> {
  ensureInitialized();
  const res = await fetch(`${API_URL}/items/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolution }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function reopenItem(id: string): Promise<ApiItem | null> {
  ensureInitialized();
  const res = await fetch(`${API_URL}/items/${id}/reopen`, {
    method: "POST",
  });
  if (!res.ok) return null;
  return res.json();
}

// Follow-up type
export interface ApiFollowUp {
  id: string;
  itemId: string;
  content: string;
  createdAt: string;
}

export async function fetchFollowups(itemId: string): Promise<ApiFollowUp[]> {
  ensureInitialized();
  const res = await fetch(`${API_URL}/followups/item/${itemId}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function createFollowup(itemId: string, content: string): Promise<ApiFollowUp | null> {
  ensureInitialized();
  const res = await fetch(`${API_URL}/followups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, content }),
  });
  if (!res.ok) return null;
  return res.json();
}

// Legacy exports for backward compatibility during migration
// These will be removed once all components are updated
export function getItemsClient() {
  throw new Error("getItemsClient is deprecated - use fetchItems/fetchItem/searchItems instead");
}

export function getFollowupsClient() {
  throw new Error("getFollowupsClient is deprecated - use fetchFollowups/createFollowup instead");
}
