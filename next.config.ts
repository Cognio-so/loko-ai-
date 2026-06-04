import type { NextConfig } from "next";
import { resolve } from "node:path";

function toOrigin(value?: string) {
  if (!value) return "";

  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
const appOrigin = toOrigin(appUrl);
const allowedServerActionOrigins = [
  appOrigin ? new URL(appOrigin).host : "",
  process.env.VERCEL_URL || "",
].filter(Boolean);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    serverActions: {
      allowedOrigins: allowedServerActionOrigins,
      bodySizeLimit: "2mb",
    },
  },
  turbopack: {
    root: resolve("."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Add other image domains as needed
      {
        protocol: "https",
        hostname: "supabase.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.openrouter.ai",
      },
    ],
  },
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/dashboard",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          // Security Headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self' ${appOrigin};
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self' data:;
              object-src 'none';
              media-src 'self';
              connect-src 'self' ${appOrigin} https://*.supabase.co wss://*.supabase.co;
              frame-src 'self' https://*.supabase.co;
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
