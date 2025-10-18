import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API route configuration for file uploads
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Increase limit for audio files
    },
  },
  
  // Experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['assemblyai'],
  },
  
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
};

export default nextConfig;
