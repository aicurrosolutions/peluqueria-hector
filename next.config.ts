import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling @prisma/client.
  // Without this, Turbopack resolves to the edge.js export (Prisma Accelerate-only)
  // instead of index.js (standard library engine), causing P6001 errors at runtime.
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
