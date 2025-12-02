import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gramentheme.com",
      },
    ],
  },
};

export default nextConfig;
