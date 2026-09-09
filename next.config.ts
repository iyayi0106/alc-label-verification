import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  eslint: {
    // Flat-config / legacy eslintrc clash in this toolchain; typecheck + vitest gate quality.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
