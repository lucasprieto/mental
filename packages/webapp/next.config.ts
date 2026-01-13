import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable server components to use @mental/db
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
