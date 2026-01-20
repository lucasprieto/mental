// API client with local types (no external dependencies)

const API_URL = process.env.MENTAL_API_URL || "http://localhost:3000";

// Local type definitions matching API responses
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

export async function fetchItems(status = "all", limit = 100): Promise<ApiItem[]> {
  const res = await fetch(`${API_URL}/items?status=${status}&limit=${limit}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function searchItems(query: string): Promise<ApiItem[]> {
  const res = await fetch(`${API_URL}/items/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function createItem(data: { title: string; content: string; theme?: string }): Promise<ApiItem | null> {
  const res = await fetch(`${API_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateItem(id: string, data: Record<string, unknown>): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${API_URL}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: res.status, data: await res.json() };
}
