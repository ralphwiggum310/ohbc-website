/** @type {import('next').NextConfig} */
const crypto = require('crypto');

const nextConfig = {
  // Enable server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'i.ytimg.com', 'yt3.ggpht.com'],
  },
  // Basic CSP configuration with required hash for inline script
  async headers() {
    // Generate a nonce for CSP
    const nonce = Buffer.from(crypto.randomBytes(16)).toString('base64');
    
    const csp = [
      // Default restrictions for most sources
      "default-src 'self' https:;",
      
      // Script sources - Added 'unsafe-eval' for NextAuth.js and other required scripts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' 'sha256-ZswfTY7H35rbv8WC7NXBoiC7WNu86vSzCDChNWwZZDM=' 'sha256-NHm6oPJKWoG64nRG8ZJtL7AWiA5+ZLnfDjKbgeZRCnQ=' 'sha256-LcsuUMiDkprrt6ZKeiLP4iYNhWo8NqaSbAgtoZxVK3s=' 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=' 'sha256-r5MWezNrp2N1nE8yXqqgSvYAYIfD9tqRDFiWSBzlKWs=' 'sha256-BqVLVP2ZEGfDXF3xdV/tEq65r86K2kXREGcVridpPNk=' 'sha256-8wQxbIqooVxC20+lEff7Zh1228Aa8y1BIki2wcisI9I=' 'sha256-CrIY5N5I/HQttys3HJnV8zKUxWK9XnTKEjVFtp8CVpY=' 'sha256-wHqGrlmBhKEpg2S4FEA6kiUHPIHgof1GfPdTYlVFDOk=' 'sha256-jHf/COQcJmORnL2bBdhdRVQnAtXNbqP1jBGlzn9RD+U=' 'sha256-9X5OQhd9uV9GSTXbo+GR6ZV48063ZCbHhyFBvCv4Bug=' 'sha256-jFaa0nOAL078Wn890hJXwwkoDFLQS/LFajQyPKWr4Dc=' 'sha256-POMutipuGLgYTi38gkG+m8y0PnCdNoWYw/8F0ER7Z8Q=' 'sha256-5BW9jsklDOgqBPS0pFffrCpwz3TznbL3ML2WMQ8OMZE=' 'nonce-${nonce}' https://www.zeffy.com https://js.stripe.com https://m.stripe.com https://m.stripe.network https://static.cloudflareinsights.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://*.facebook.com https://*.facebook.net https://*.hotjar.com https://*.hubspot.com https://*.hs-scripts.com https://*.hs-analytics.net https://*.hs-banner.com https://*.hsadspixel.net https://*.hscollectedforms.net https://*.hsleadflows.net https://*.googleapis.com https://*.google.com https://*.gstatic.com https://*.stripe.com;",
      
      // Script sources for script elements - Matched with script-src plus 'strict-dynamic'
      "script-src-elem 'self' 'unsafe-inline' 'strict-dynamic' 'sha256-ZswfTY7H35rbv8WC7NXBoiC7WNu86vSzCDChNWwZZDM=' 'sha256-NHm6oPJKWoG64nRG8ZJtL7AWiA5+ZLnfDjKbgeZRCnQ=' 'sha256-LcsuUMiDkprrt6ZKeiLP4iYNhWo8NqaSbAgtoZxVK3s=' 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=' 'sha256-r5MWezNrp2N1nE8yXqqgSvYAYIfD9tqRDFiWSBzlKWs=' 'sha256-BqVLVP2ZEGfDXF3xdV/tEq65r86K2kXREGcVridpPNk=' 'sha256-8wQxbIqooVxC20+lEff7Zh1228Aa8y1BIki2wcisI9I=' 'sha256-CrIY5N5I/HQttys3HJnV8zKUxWK9XnTKEjVFtp8CVpY=' 'sha256-wHqGrlmBhKEpg2S4FEA6kiUHPIHgof1GfPdTYlVFDOk=' 'sha256-jHf/COQcJmORnL2bBdhdRVQnAtXNbqP1jBGlzn9RD+U=' 'sha256-9X5OQhd9uV9GSTXbo+GR6ZV48063ZCbHhyFBvCv4Bug=' 'sha256-jFaa0nOAL078Wn890hJXwwkoDFLQS/LFajQyPKWr4Dc=' 'sha256-POMutipuGLgYTi38gkG+m8y0PnCdNoWYw/8F0ER7Z8Q=' 'sha256-5BW9jsklDOgqBPS0pFffrCpwz3TznbL3ML2WMQ8OMZE=' https://www.zeffy.com https://js.stripe.com https://m.stripe.com https://m.stripe.network https://static.cloudflareinsights.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://*.facebook.com https://*.facebook.net https://*.hotjar.com https://*.hubspot.com https://*.hs-scripts.com https://*.hs-analytics.net https://*.hs-banner.com https://*.hsadspixel.net https://*.hscollectedforms.net https://*.hsleadflows.net https://*.googleapis.com https://*.google.com https://*.gstatic.com https://*.stripe.com;",
      
      // Connect sources
      "connect-src 'self' https://www.zeffy.com https://js.stripe.com https://m.stripe.com https://m.stripe.network https://static.cloudflareinsights.com https://*.facebook.com https://*.facebook.net https://*.google-analytics.com https://*.googletagmanager.com https://pagead2.googlesyndication.com https://www.google.com https://*.hotjar.com https://*.hubspot.com https://*.hs-scripts.com https://*.hs-analytics.net https://*.hs-banner.com https://*.hsadspixel.net https://*.hscollectedforms.net https://*.hsleadflows.net https://*.googleapis.com https://*.google.com https://*.gstatic.com https://*.doubleclick.net https://*.googleadservices.com https://*.google-analytics.com https://*.googletagmanager.com https://*.google.com https://*.g.doubleclick.net https://*.stripe.com https://api.stripe.com https://b.stripecdn.com https://checkout.stripe.com https://pagead2.googlesyndication.com;",
      
      // Style sources - Added hashes for inline styles and 'unsafe-hashes' for style attributes
      "style-src 'self' 'unsafe-inline' 'unsafe-hashes' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-XuZfwKN78eRqPJDEWnVYsirbYrjzzgUNftKagRBcz1E=' 'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk=' 'sha256-68ahHyH65aqS202beKyu22MkdAEr0fBCN3eHnbYX+wg=' 'sha256-twJvty5Z/drnAS7oWuJ6FV2znGlcmcmXe3atjEzB+a4=' 'sha256-K4D0A6JM8VOMviJLwGYdKO73w6Uk2JiK0zCKovt7ITY=' https:;",
      
      // Style attributes
      "style-src-attr 'self' 'unsafe-inline' 'unsafe-hashes' 'sha256-XuZfwKN78eRqPJDEWnVYsirbYrjzzgUNftKagRBcz1E=' 'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk=' 'sha256-68ahHyH65aqS202beKyu22MkdAEr0fBCN3eHnbYX+wg=' 'sha256-twJvty5Z/drnAS7oWuJ6FV2znGlcmcmXe3atjEzB+a4=' 'sha256-K4D0A6JM8VOMviJLwGYdKO73w6Uk2JiK0zCKovt7ITY=' https:;",
      
      // Image sources
      "img-src 'self' data: blob: https: http:;",
      
      // Font sources
      "font-src 'self' https: data:;",
      
      // Frame sources - Added additional Stripe domains and made more permissive for Firefox
      "frame-src 'self' https://www.zeffy.com https://js.stripe.com https://m.stripe.com https://m.stripe.network https://checkout.stripe.com https://hooks.stripe.com https://b.stripecdn.com https://*.stripe.com https://*.stripe.network https://*.stripecdn.com;",
      
      // Required for Firefox to allow the iframe to function properly
      "child-src 'self' blob: https://www.zeffy.com https://js.stripe.com https://m.stripe.com https://m.stripe.network https://checkout.stripe.com https://hooks.stripe.com https://b.stripecdn.com https://*.stripe.com https://*.stripe.network https://*.stripecdn.com;",
      
      // Other restrictions
      "object-src 'none';",
      "base-uri 'self';",
      "form-action 'self' https://www.zeffy.com https://*.stripe.com https://checkout.stripe.com;",
      "frame-ancestors 'self' https://www.zeffy.com;",
      "worker-src 'self' blob:;",
      "child-src 'self' blob: https://www.zeffy.com https://js.stripe.com https://m.stripe.com https://m.stripe.network https://checkout.stripe.com;"
    ];

    return [
      {
        source: '/give',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp.join(' ')
          },
          {
            key: 'X-Content-Security-Policy',
            value: csp.join(' ')
          },
          {
            key: 'X-WebKit-CSP',
            value: csp.join(' ')
          }
        ]
      }
    ];
  },
  // Use Next.js built-in CSS support
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next',
            name: 'static/media/[name].[hash].[ext]',
          },
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
