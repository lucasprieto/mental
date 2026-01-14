import { hc } from "hono/client";
import type { ItemsRoute, SessionsRoute, FollowupsRoute } from "@mental/api";

const API_URL = process.env.MENTAL_API_URL || "http://localhost:3000";

let itemsClient: ReturnType<typeof hc<ItemsRoute>> | null = null;
let sessionsClient: ReturnType<typeof hc<SessionsRoute>> | null = null;
let followupsClient: ReturnType<typeof hc<FollowupsRoute>> | null = null;
let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    console.error(`[mental-mcp] Connecting to API: ${API_URL}`);
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

export function getSessionsClient() {
  if (!sessionsClient) {
    ensureInitialized();
    sessionsClient = hc<SessionsRoute>(`${API_URL}/sessions`);
  }
  return sessionsClient;
}

export function getFollowupsClient() {
  if (!followupsClient) {
    ensureInitialized();
    followupsClient = hc<FollowupsRoute>(`${API_URL}/followups`);
  }
  return followupsClient;
}
