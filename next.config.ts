import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/camp", destination: "/" },
        { source: "/camp/", destination: "/" },
        { source: "/camp/:path*", destination: "/:path*" },
      ],
    };
  },
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
