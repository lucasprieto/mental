import { hc } from "hono/client";

/**
 * API client configuration for Mental MCP server.
 *
 * Environment variable:
 * - MENTAL_API_URL: URL of the Mental API server (default: http://localhost:3000)
 *
 * The API types are not strictly typed here to avoid workspace dependencies.
 * The Hono RPC client will work correctly at runtime.
 */

const API_URL = process.env.MENTAL_API_URL || "http://localhost:3000";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRoute = any;

let itemsClient: ReturnType<typeof hc<AnyRoute>> | null = null;
let sessionsClient: ReturnType<typeof hc<AnyRoute>> | null = null;
let followupsClient: ReturnType<typeof hc<AnyRoute>> | null = null;
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
    itemsClient = hc<AnyRoute>(`${API_URL}/items`);
  }
  return itemsClient;
}

export function getSessionsClient() {
  if (!sessionsClient) {
    ensureInitialized();
    sessionsClient = hc<AnyRoute>(`${API_URL}/sessions`);
  }
  return sessionsClient;
}

export function getFollowupsClient() {
  if (!followupsClient) {
    ensureInitialized();
    followupsClient = hc<AnyRoute>(`${API_URL}/followups`);
  }
  return followupsClient;
}
