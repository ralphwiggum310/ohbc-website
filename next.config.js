/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    domains: [
      'localhost',
      'orchardhillsbiblechurch.com',
      'www.orchardhillsbiblechurch.com'
    ],
    // Disable image optimization in production
    unoptimized: true,
    // Keep these for reference
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Base configuration
  basePath: '',
  assetPrefix: '',
  output: 'standalone',
  // Enable static file serving
  staticPageGeneration: {
    // Ensure static files are generated
    // and available at the root
    // This helps with serving files like favicon.ico
    // and other static assets
  },
  // Configure static file handling
  async headers() {
    return [
      {
        // Match all static files
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
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
  
  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Security headers with CSP
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              `default-src 'self' https://*.orchardhillsbiblechurch.com https://www.zeffy.com https://api.zeffy.com https://js.stripe.com`,
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.orchardhillsbiblechurch.com https://*.zeffy.com https://*.stripe.com https://js.stripe.com https://m.stripe.network https://*.google.com https://*.googleapis.com https://*.gstatic.com`,
              `style-src 'self' 'unsafe-inline' https://*.orchardhillsbiblechurch.com https://*.zeffy.com https://*.googleapis.com https://fonts.googleapis.com`,
              `img-src 'self' data: blob: https: http: https://*.orchardhillsbiblechurch.com https://*.zeffy.com https://*.stripe.com https://*.ytimg.com https://*.google.com https://*.googleapis.com https://*.gstatic.com`,
              `font-src 'self' data: https: http: https://*.orchardhillsbiblechurch.com https://*.zeffy.com https://fonts.gstatic.com`,
              `connect-src 'self' https: http: https://*.orchardhillsbiblechurch.com https://*.zeffy.com https://api.zeffy.com https://js.stripe.com https://api.stripe.com https://m.stripe.network https://*.google.com https://*.googleapis.com https://*.gstatic.com`,
              `frame-src 'self' https://*.orchardhillsbiblechurch.com https://www.zeffy.com https://js.stripe.com https://checkout.stripe.com https://m.stripe.network https://*.google.com`,
              `child-src 'self' https://*.orchardhillsbiblechurch.com https://www.zeffy.com https://js.stripe.com https://checkout.stripe.com https://m.stripe.network https://*.google.com`,
              `form-action 'self' https://*.orchardhillsbiblechurch.com https://www.zeffy.com https://checkout.stripe.com`
            ].join('; ')
          }
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
  generateEtags: true,
  compress: true,
  trailingSlash: false,
  productionBrowserSourceMaps: false,
  
  // Public directory for static assets
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/public',
  },
};

module.exports = nextConfig;
