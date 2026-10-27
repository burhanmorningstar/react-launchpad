# Multi-stage build for production

# Stage 1: Dependencies
FROM node:24.20.0-alpine AS deps
RUN corepack enable
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
RUN corepack install
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM deps AS builder
WORKDIR /app

# Copy dependencies and source
COPY . .

# Build application
RUN pnpm build

# Stage 3: Production
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
