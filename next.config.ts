import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Draft API routes reference models not yet in schema — skip type errors at build time
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;
