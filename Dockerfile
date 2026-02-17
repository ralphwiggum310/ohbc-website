# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

# Create prisma directory and copy if it exists
RUN mkdir -p prisma && \
    if [ -d ./prisma ]; then \
        cp -r ./prisma/. ./prisma/ || echo "No prisma files to copy"; \
    fi

# Install all dependencies including devDependencies
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application
COPY . .

# Set environment to production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone .
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the user to non-root
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the hostname to localhost
ENV HOSTNAME "0.0.0.0"

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
