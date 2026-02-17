/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Basic configuration for Next.js 16.1.6
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    }
  },
  
  // Turbopack configuration for Next.js 16
  turbopack: {
    // Empty config to silence the error
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    return config;
  },
  
  // Configure SWC
  compiler: {
    // Enable SWC minification
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization with remote patterns
  images: {
    remotePatterns: [
      // YouTube thumbnails
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      // Production domains
      {
        protocol: 'https',
        hostname: 'orchardhillsbiblechurch.com',
      },
      {
        protocol: 'https',
        hostname: 'www.orchardhillsbiblechurch.com',
      },
      // Fallback for any other domains (use with caution)
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Disable image optimization in development to improve performance
    unoptimized: process.env.NODE_ENV === 'development',
    // Standard device and image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Base configuration
  output: 'standalone',
  
  // Configure static file handling
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              `default-src 'self' https://*.orchardhillsbiblechurch.com https://www.zeffy.com https://api.zeffy.com`,
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.orchardhillsbiblechurch.com https://*.zeffy.com https://*.google.com https://*.googleapis.com https://*.gstatic.com`,
              `style-src 'self' 'unsafe-inline' https://*.orchardhillsbiblechurch.com https://*.zeffy.com https://*.googleapis.com https://fonts.googleapis.com`,
              `img-src 'self' data: blob: https: http: https://*.orchardhillsbiblechurch.com https://*.zeffy.com https://*.ytimg.com https://*.google.com https://*.googleapis.com https://*.gstatic.com`,
              `font-src 'self' data: https: http: https://*.orchardhillsbiblechurch.com https://*.zeffy.com https://fonts.gstatic.com`,
              `connect-src 'self' https: http: https://*.orchardhillsbiblechurch.com https://*.zeffy.com https://api.zeffy.com https://*.google.com https://*.googleapis.com https://*.gstatic.com`,
              `frame-src 'self' https://*.orchardhillsbiblechurch.com https://www.zeffy.com https://*.google.com`,
              `child-src 'self' https://*.orchardhillsbiblechurch.com https://www.zeffy.com https://*.google.com`,
              `form-action 'self' https://*.orchardhillsbiblechurch.com https://www.zeffy.com`
            ].join('; ')
          },
          // Cache control for static files
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      // Specific rule for favicon
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Important: return the modified config
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
      
      // Ensure public URL is set correctly
      if (process.env.NODE_ENV === 'production') {
        config.output.publicPath = '/_next/';
      }
    }
    
    // Ensure proper handling of static files
    if (!isServer) {
      config.module.rules.push({
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash][ext]',
          publicPath: '/_next/',
        },
      });
    }

    // Copy files from public to static folder during production build
    if (!dev && !isServer) {
      const fs = require('fs');
      const path = require('path');
      
      // Ensure the static directory exists
      const staticDir = path.join(__dirname, 'public/static');
      if (!fs.existsSync(staticDir)) {
        fs.mkdirSync(staticDir, { recursive: true });
      }
    }
    
    return config;
  },
  
  // Static export configuration (only for static pages)
  // We're not using output: 'export' to support API routes
  // But we need to ensure static assets are served correctly
  poweredByHeader: false,
  
  // Disable source maps in development
  productionBrowserSourceMaps: false,
  generateEtags: true,
  compress: true,
  trailingSlash: false,
  productionBrowserSourceMaps: false,
  
  // Static folder is now automatically handled by Next.js
};

module.exports = nextConfig;
