import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages for server components (moved from experimental)
  serverExternalPackages: ['assemblyai', 'better-auth'],
  
  // Image and file handling
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Environment variables
  env: {
    ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
