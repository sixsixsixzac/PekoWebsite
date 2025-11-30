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
    ],
    qualities: [70, 85, 90],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    // Disable image optimization for local images to prevent 400 errors
    // Local images in /images/ will be served directly without optimization
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [
      { source: '/signin', destination: '/auth/signin' },
      { source: '/signup', destination: '/auth/signup' },
    ];
  },
  // Optimize JavaScript bundle size and code splitting
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'lucide-react',
    ],
  },
  // Compress output
  compress: true,
  // Optimize production builds (source maps disabled for smaller bundles)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
