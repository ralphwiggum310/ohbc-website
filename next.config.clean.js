/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable server actions
  experimental: {
    serverActions: true,
  },
  
  // External packages that need to be processed by webpack
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['localhost', 'orchardhillsbiblechurch.com', 'www.orchardhillsbiblechurch.com'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // Webpack configuration
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
