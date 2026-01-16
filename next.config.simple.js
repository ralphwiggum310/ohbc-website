/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicitly set the base path and asset prefix
  basePath: '',
  assetPrefix: '',
  // Disable type checking and linting during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Basic security headers without CSP for now
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  // Webpack configuration
  webpack(config) {
    return config;
  },
};

module.exports = nextConfig;
