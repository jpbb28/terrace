import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://terrasseseason.com";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const apiCorsHeaders = [
  { key: "Access-Control-Allow-Origin", value: SITE_URL },
  { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
];

const nextConfig: NextConfig = {
  turbopack: {},
  async redirects() {
    return [
      {
        source: "/terraces/moqueur",
        destination: "/terraces/terrasse-chez-miller",
        permanent: true,
      },
      {
        source: "/terraces/pangea",
        destination: "/terraces/pangea-restaurant-bar",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Reverse proxy PostHog through a first-party path so ad/tracker
    // blockers don't drop analytics requests to *.posthog.com.
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/api/(.*)",
        headers: apiCorsHeaders,
      },
      {
        // Service worker must never be served from HTTP cache —
        // browsers need to fetch it fresh to detect updates.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: true,
  workboxOptions: {
    clientsClaim: true,
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: ({ request }: { request: Request }) =>
          request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 3,
        },
      },
    ],
  },
})(nextConfig);

export default withSentryConfig(pwaConfig, {
  org: "jpbb",
  project: "terrace-season",
  silent: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
