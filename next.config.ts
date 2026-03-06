import type { NextConfig } from "next";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ??
  "";

function toHostname(value: string) {
  try {
    if (!value) return "";
    return value.includes("://") ? new URL(value).hostname : value;
  } catch {
    return "";
  }
}

function deriveHostnameFromS3Endpoint(value: string) {
  try {
    if (!value) return "";
    const url = value.includes("://") ? new URL(value) : null;
    return url?.hostname ?? "";
  } catch {
    return "";
  }
}

const supabaseHostname = toHostname(supabaseUrl);
const s3Hostname =
  deriveHostnameFromS3Endpoint(process.env.NEXT_PUBLIC_SUPABASE_S3_ENDPOINT ?? "") ||
  deriveHostnameFromS3Endpoint(process.env.SUPABASE_S3_ENDPOINT ?? "");

const extraAllowedHosts = ([] as string[]).map(toHostname).filter(Boolean);

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
    localPatterns: [{ pathname: "/_next/image" }],
    remotePatterns: allowedHosts.flatMap((hostname) => [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/**",
      },
    ]),
  },

  async redirects() {
    return [
      {
        source: "/shop/category/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/shop/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
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