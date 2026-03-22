import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/api/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.creatorhive.ae" },
      // Editorial ingestion sources
      { protocol: "https", hostname: "image-cdn.hypb.st" },
      { protocol: "https", hostname: "media.voguearabia.com" },
      { protocol: "https", hostname: "assets.vogue.com" },
      { protocol: "https", hostname: "media.gq.com" },
      { protocol: "https", hostname: "*.highsnobiety.com" },
      { protocol: "https", hostname: "assets.glossy.co" },
      { protocol: "https", hostname: "media.wwd.com" },
      { protocol: "https", hostname: "img.businessoffashion.com" },
      { protocol: "https", hostname: "*.tubefilter.com" },
      { protocol: "https", hostname: "*.modernretail.co" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dashboard/hive/shop/new",
        destination: "/dashboard/hive/build/new",
        permanent: false,
      },
      {
        source: "/dashboard/hive/shop/new/:path*",
        destination: "/dashboard/hive/build/new/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/hive/shop/:id",
        destination: "/dashboard/hive/build/:id",
        permanent: false,
      },
    ];
  },
};

export default withPWA(nextConfig);
