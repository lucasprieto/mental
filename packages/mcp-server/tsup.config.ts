import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  bundle: true,
  // Keep runtime dependencies external - they'll be installed by npm
  external: [
    "@modelcontextprotocol/sdk",
    "zod",
    "hono",
  ],
  // Add shims for CommonJS compatibility if needed
  shims: true,
  // Generate sourcemaps for debugging
  sourcemap: false,
  // Minify for smaller package size
  minify: false,
  // Add banner with shebang for CLI
  banner: {
    js: "#!/usr/bin/env node",
  },
});
