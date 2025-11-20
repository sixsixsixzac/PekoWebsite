import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      // Add more image domains as needed for your production images
      // {
      //   protocol: 'https',
      //   hostname: 'your-cdn-domain.com',
      //   pathname: '/**',
      // },
    ],
    qualities: [75, 85],
  },
};

export default nextConfig;
