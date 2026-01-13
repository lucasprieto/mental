import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

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

// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[mental-mcp] Server started");
