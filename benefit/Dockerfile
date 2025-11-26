# ==============================================================================
# Multi-stage Dockerfile for Benefit Angular Application
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
RUN npm ci --legacy-peer-deps --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the Angular application for production
RUN npm run build -- --configuration production

# Prepare build output in a consistent location
# Angular 20 with @angular/build may output to dist/benefit/browser or dist/benefit
RUN mkdir -p /app/dist-output && \
    if [ -d /app/dist/benefit/browser ]; then \
        cp -r /app/dist/benefit/browser/* /app/dist-output/; \
    elif [ -d /app/dist/benefit ]; then \
        cp -r /app/dist/benefit/* /app/dist-output/; \
    else \
        echo "Error: Build output not found. Checking dist directory:" && \
        ls -la /app/dist/ && \
        exit 1; \
    fi

# ------------------------------------------------------------------------------
# Stage 2: Production Stage
# ------------------------------------------------------------------------------
FROM nginx:1.25-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist-output /usr/share/nginx/html

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

