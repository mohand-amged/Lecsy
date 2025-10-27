import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages for server components (moved from experimental)
  serverExternalPackages: ['assemblyai', 'better-auth'],
  
  // React strict mode for development
  reactStrictMode: true,
  
  // Image and file handling with optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Environment variables
  env: {
    ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Note: eslint config moved to eslint.config.js in Next.js 16
  // To ignore eslint during builds, use: next build --skip-lint
};

export default nextConfig;
