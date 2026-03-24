import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  generateBuildId: async () => {
    return process.env.GIT_HASH || process.env.GITHUB_SHA || "dev-build";
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
