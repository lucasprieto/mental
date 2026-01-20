import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  bundle: true,
  // Bundle all dependencies except Node.js builtins
  noExternal: [/.*/],
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
