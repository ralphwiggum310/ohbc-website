# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build && \
    # Verify build output exists
    if [ ! -d ".next/standalone" ] || [ ! -d ".next/static" ]; then \
        echo "Error: Build output is missing required directories" && \
        ls -la .next && \
        exit 1; \
    fi

# Stage 2: Production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Create a non-root user and set permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nextjs && \
    chown -R nextjs:nodejs /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Create necessary directories
RUN mkdir -p .next/static && \
    mkdir -p public/_next/static

# Copy built assets from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public directory and ensure proper permissions
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create symlink for static files
RUN ln -sf /app/.next/static /app/public/_next/static

# Copy other necessary files
COPY --chown=nextjs:nodejs next.config.js ./
COPY --chown=nextjs:nodejs next-env.d.ts ./
COPY --chown=nextjs:nodejs tsconfig.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS=--max_old_space_size=2048

# Switch to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
