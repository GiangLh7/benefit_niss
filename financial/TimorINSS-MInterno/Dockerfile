# ==============================================================================
# Multi-stage Dockerfile for Angular 20 Application
# Optimized for minimal image size using best practices
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Stage
# ------------------------------------------------------------------------------
FROM node:23-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies required for node-gyp and native builds
RUN apk add --no-cache python3 make g++

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install ALL dependencies (including dev) for building
# Angular CLI and build tools are in devDependencies
RUN npm ci --legacy-peer-deps --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the Angular application for production
# --configuration production enables optimizations like minification, tree-shaking
RUN npm run build -- --configuration production

# ------------------------------------------------------------------------------
# Stage 2: Production Stage
# ------------------------------------------------------------------------------
FROM nginx:1.25-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy custom nginx configuration
# nginx-default.conf includes API proxy to http://fin.timorniss.online:5000
# This replaces proxy.conf.json used in development
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/TimorINSS-MInterno /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

# Switch to non-root user
USER appuser

# Expose port 8080 (non-privileged port)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

