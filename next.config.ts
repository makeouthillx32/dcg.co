// next.config.ts
import type { NextConfig } from "next";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ??
  "";

// Build a safe allow-list of hostnames (and strip schemes if someone pastes them)
function toHostname(value: string) {
  try {
    if (!value) return "";
    return value.includes("://") ? new URL(value).hostname : value;
  } catch {
    return "";
  }
}

// If you provide SUPABASE_S3_ENDPOINT, also allow its hostname (storage domain)
function deriveHostnameFromS3Endpoint(value: string) {
  try {
    if (!value) return "";
    const url = value.includes("://") ? new URL(value) : null;
    // if it's a full URL, hostname is what we want
    return url?.hostname ?? "";
  } catch {
    return "";
  }
}

const supabaseHostname = toHostname(supabaseUrl);
const s3Hostname =
  deriveHostnameFromS3Endpoint(process.env.NEXT_PUBLIC_SUPABASE_S3_ENDPOINT ?? "") ||
  deriveHostnameFromS3Endpoint(process.env.SUPABASE_S3_ENDPOINT ?? "");

// Optional: if you ever use another storage/transform host, add it here.
const extraAllowedHosts = [
  // "images.yourdomain.com",
]
  .map(toHostname)
  .filter(Boolean);

const allowedHosts = Array.from(
  new Set([supabaseHostname, s3Hostname, ...extraAllowedHosts].filter(Boolean))
);

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      ".css": {
        as: "*.css",
        loaders: ["postcss-loader"],
      },
    },
  },

  images: {
    // ✅ Allow Next’s own optimizer route (fixes: "query string ... not configured in images.localPatterns")
    // This is safe and only matches the internal /_next/image route.
    localPatterns: [{ pathname: "/_next/image" }],

    // ✅ Allow Supabase public storage (both project domain + storage domain if present)
    remotePatterns: allowedHosts.flatMap((hostname) => [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
      // If you ever hit the storage domain directly for public objects, allow it too.
      // (Some setups generate storage.<ref>.supabase.co URLs.)
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/**",
      },
    ]),
  },

  async headers() {
    return [
      {
        source: "/opengraph-image.png",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/twitter-image.png",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/dist/**",
          "**/build/**",
        ],
      };
    }
    return config;
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"],
  },
};

export default nextConfig;
