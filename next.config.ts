import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  generateBuildId: async () => {
    return process.env.GIT_HASH || null;
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
