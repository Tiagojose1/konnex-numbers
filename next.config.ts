import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": path.resolve(process.cwd(), "src"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
};

export default nextConfig;