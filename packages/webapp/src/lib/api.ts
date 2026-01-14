import { hc } from "hono/client";
import type { ItemsRoute } from "@mental/api";

const API_URL = process.env.MENTAL_API_URL || "http://localhost:3000";

let itemsClient: ReturnType<typeof hc<ItemsRoute>> | null = null;
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
