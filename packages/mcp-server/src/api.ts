import { hc } from "hono/client";
import type { AppType } from "@mental/api";

const API_URL = process.env.MENTAL_API_URL || "http://localhost:3000";
let client: ReturnType<typeof hc<AppType>> | null = null;

export function getApiClient() {
  if (!client) {
    console.error(`[mental-mcp] Connecting to API: ${API_URL}`);
    client = hc<AppType>(API_URL);
  }
  return client;
}
