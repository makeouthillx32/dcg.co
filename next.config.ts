// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chsmesvozsjcgrwuimld.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },
  // Add CORS headers for OpenGraph images
  async headers() {
    return [
      {
        source: '/opengraph-image.png',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
      {
        source: '/twitter-image.png',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true, // ⛔ Temporarily disables type-checking for production builds
  },
  // Fix for Watchpack watcher errors
  webpack: (config, { dev }) => {
    if (dev) {
      // Configure webpack watcher for development
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay rebuild after first change
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
          '**/build/**',
        ],
      };
    }
    return config;
  },
  // Additional Next.js experimental features to reduce watcher load
  experimental: {
    // Reduce the number of files being watched
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
};

export default nextConfig;