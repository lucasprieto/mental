import { hc } from "hono/client";
import type { ItemsRoute, FollowupsRoute } from "@mental/api";

const API_URL = process.env.MENTAL_API_URL || "http://localhost:3000";

let itemsClient: ReturnType<typeof hc<ItemsRoute>> | null = null;
let followupsClient: ReturnType<typeof hc<FollowupsRoute>> | null = null;
let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    console.log(`[mental-webapp] Connecting to API: ${API_URL}`);
    initialized = true;
  }
}

export function getItemsClient() {
  if (!itemsClient) {
    ensureInitialized();
    itemsClient = hc<ItemsRoute>(`${API_URL}/items`);
  }
  return itemsClient;
}

export function getFollowupsClient() {
  if (!followupsClient) {
    ensureInitialized();
    followupsClient = hc<FollowupsRoute>(`${API_URL}/followups`);
  }
  return followupsClient;
}

export async function searchItems(query: string) {
  ensureInitialized();
  const client = getItemsClient();
  const res = await client.search.$get({ query: { q: query } });
  return res.json();
}
