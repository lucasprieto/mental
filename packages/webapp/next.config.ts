import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable server components to use @mental/db
  serverExternalPackages: ["better-sqlite3", "drizzle-orm", "@mental/db"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle native modules
      config.externals = [...(config.externals || []), "better-sqlite3"];
    }
    return config;
  },
};

export default nextConfig;
