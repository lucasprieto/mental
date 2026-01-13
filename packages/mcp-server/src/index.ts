import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "mental-mcp",
  version: "1.0.0"
});

// Simple ping tool to verify connectivity
server.tool(
  "ping",
  "Health check - returns pong to verify server is running",
  {},
  async () => {
    console.error("[mental-mcp] Ping received");
    return {
      content: [{ type: "text", text: "pong" }]
    };
  }
);

// Capture thought tool - stub until Phase 3 database integration
server.tool(
  "capture_thought",
  "Capture a thought or topic to your mental database. Use this when the user mentions something they want to remember, track, or come back to later.",
  {
    title: z.string().describe("Brief title for the thought (2-10 words)"),
    content: z.string().describe("Full content or context of the thought"),
    tags: z.array(z.string()).optional().describe("Optional tags for categorization")
  },
  async ({ title, content, tags }) => {
    console.error(`[mental-mcp] Capturing thought: "${title}"`);
    console.error(`[mental-mcp] Content: ${content.substring(0, 100)}...`);
    console.error(`[mental-mcp] Tags: ${tags?.join(", ") || "none"}`);

    // TODO: Phase 3 will add actual database persistence

    return {
      content: [{
        type: "text",
        text: `Captured thought: "${title}"\n\nThis thought has been logged. (Note: Database persistence coming in Phase 3)`
      }]
    };
  }
);

// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[mental-mcp] Server started");
