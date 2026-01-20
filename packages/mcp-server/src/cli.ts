/**
 * CLI entry point for @go-mental/mcp
 *
 * This file is the entry point when running:
 * - npx @go-mental/mcp
 * - go-mental-mcp (if installed globally)
 *
 * Configuration:
 * - MENTAL_API_URL: URL of the Mental API server (required)
 */

// Import and run the MCP server
import "./index.js";

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.error("[mental-mcp] Shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("[mental-mcp] Shutting down...");
  process.exit(0);
});
