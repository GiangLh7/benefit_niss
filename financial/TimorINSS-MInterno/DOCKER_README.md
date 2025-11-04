# Docker Deployment Guide

This guide explains how to build and run the TimorINSS Angular application using Docker.

## 📦 Files Overview

- **Dockerfile**: Multi-stage build configuration (optimized for size)
- **nginx.conf**: Nginx main configuration
- **nginx-default.conf**: Server-specific configuration
- **docker-compose.yml**: Docker Compose orchestration
- **.dockerignore**: Files to exclude from Docker build context

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Using Helper Scripts (Easiest)

```bash
# Quick rebuild (uses cache for faster builds)
./docker-rebuild.sh

# Full rebuild without cache (slower but fresh)
./docker-rebuild-no-cache.sh

# Using Docker Compose
./docker-compose-rebuild.sh
```

### Option 2: Using Docker Commands

```bash
# Build the image
docker build -t timor-inss-frontend:latest .

# Run the container
docker run -d \
  --name timor-inss-frontend \
  -p 8080:8080 \
  --restart unless-stopped \
  timor-inss-frontend:latest

# View logs
docker logs -f timor-inss-frontend

# Stop and remove
docker stop timor-inss-frontend
docker rm timor-inss-frontend
```

## 🔍 Verification

Once the container is running:

1. **Check health**: `curl http://localhost:8080/health`
2. **Open application**: http://localhost:8080
3. **Check logs**: `docker logs timor-inss-frontend`

## 🔄 Rebuilding After Code Changes

### Quick Reference

| Scenario | Command | Speed |
|----------|---------|-------|
| Code changed (TypeScript/HTML/CSS) | `./docker-rebuild.sh` | ~2-3 min |
| Dependencies changed (package.json) | `./docker-rebuild-no-cache.sh` | ~5-7 min |
| Using Docker Compose | `docker-compose up -d --build` | ~2-3 min |
| Force complete rebuild | `docker build --no-cache -t timor-inss-frontend:latest .` | ~5-7 min |

### Development Workflow

#### **Typical Workflow (Code Changes)**

```bash
# 1. Make your code changes in src/

# 2. Rebuild and restart
./docker-rebuild.sh

# 3. Check logs (optional)
docker logs -f timor-inss-frontend

# 4. Open http://localhost:8080 in browser
```

#### **When Dependencies Change (package.json)**

```bash
# Use no-cache rebuild
./docker-rebuild-no-cache.sh
```

#### **Manual Step-by-Step**

```bash
# 1. Stop current container
docker stop timor-inss-frontend

# 2. Remove container
docker rm timor-inss-frontend

# 3. Rebuild image
docker build -t timor-inss-frontend:latest .

# 4. Start new container
docker run -d -p 8080:8080 --name timor-inss-frontend timor-inss-frontend:latest
```

### Understanding Docker Layer Caching

Docker caches layers to speed up rebuilds. Here's what happens:

```dockerfile
# ✅ CACHED - Only rebuilds if Dockerfile changes
FROM node:23-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++

# ✅ CACHED - Only rebuilds if package.json/package-lock.json change
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# ⚠️ REBUILDS EVERY TIME - Your source code changes frequently
COPY . .
RUN npm run build

# ✅ CACHED - Only rebuilds if nginx config changes
COPY nginx.conf /etc/nginx/nginx.conf
```

**Key Points:**
- Changes to **source code** (src/) trigger rebuild from `COPY . .` step onward
- Changes to **package.json** trigger rebuild from `npm ci` step onward
- Changes to **Dockerfile** trigger complete rebuild
- Use `--no-cache` flag to force rebuild everything

### Build Time Expectations

| Build Type | Time | When to Use |
|------------|------|-------------|
| First build | 5-7 min | Initial setup |
| Rebuild (code change) | 2-3 min | Most code changes |
| Rebuild (no cache) | 5-7 min | After package.json changes or issues |
| Cached layers only | 10-20 sec | No actual changes |

## 📊 Image Size Optimization

The Dockerfile uses several techniques to minimize image size:

### 1. **Multi-stage Build**
- Build stage: Full Node.js environment
- Production stage: Lightweight nginx-alpine (~50MB base)

### 2. **Alpine Linux**
- Uses `node:23-alpine` and `nginx:1.25-alpine`
- Significantly smaller than standard images

### 3. **Layer Optimization**
- Separate layer for dependencies (`package.json` copied first)
- Enables Docker layer caching
- Only rebuilds when dependencies change

### 4. **Clean npm Install**
- Uses `npm ci` for reproducible builds
- Excludes dev dependencies: `--omit=dev`
- Clears cache: `npm cache clean --force`

### 5. **.dockerignore**
- Excludes unnecessary files from build context
- Reduces build time and image size

## 🔒 Security Features

### 1. **Non-root User**
- Runs nginx as user `appuser` (UID 1001)
- Prevents privilege escalation

### 2. **Security Headers**
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### 3. **Health Check**
- Automatic container health monitoring
- Enables orchestration tools to detect issues

### 4. **Minimal Attack Surface**
- Only production code included
- No development tools or source files
- Alpine-based minimal OS

## ⚙️ Configuration

### Environment Variables

You can override settings using environment variables:

```bash
docker run -d \
  -e NODE_ENV=production \
  -p 8080:8080 \
  timor-inss-frontend:latest
```

### API Proxy Configuration

To enable API proxying, edit `nginx-default.conf` and uncomment the proxy section:

```nginx
location /api {
    proxy_pass http://fin.timorniss.online:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

Then rebuild:
```bash
docker-compose up -d --build
```

## 🔧 Troubleshooting

### Container won't start

```bash
# Check logs
docker logs timor-inss-frontend

# Check if port is in use
lsof -i :8080
```

### Build fails

```bash
# Clean Docker build cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t timor-inss-frontend:latest .
```

### Application not accessible

```bash
# Check if container is running
docker ps | grep timor-inss-frontend

# Check container health
docker inspect --format='{{.State.Health.Status}}' timor-inss-frontend

# Test from inside container
docker exec timor-inss-frontend wget -O- http://localhost:8080/health
```

## 📈 Performance Tips

### 1. **Enable nginx Caching**
Already configured in `nginx-default.conf`:
- Static assets cached for 1 year
- index.html not cached (for updates)

### 2. **Gzip Compression**
Enabled in `nginx.conf` for text-based content

### 3. **Resource Limits**

```bash
docker run -d \
  --memory="512m" \
  --cpus="0.5" \
  -p 8080:8080 \
  timor-inss-frontend:latest
```

## 🏷️ Image Size Comparison

Expected final image sizes:
- **Build stage**: ~1.5GB (not included in final image)
- **Production image**: ~50-80MB (nginx + Angular build)

Check your image size:
```bash
docker images | grep timor-inss-frontend
```

## 🌐 Production Deployment

### Using Docker Swarm

```bash
docker stack deploy -c docker-compose.yml timor-inss
```

### Using Kubernetes

Create a Kubernetes deployment (example):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: timor-inss-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: timor-inss-frontend
  template:
    metadata:
      labels:
        app: timor-inss-frontend
    spec:
      containers:
      - name: frontend
        image: timor-inss-frontend:latest
        ports:
        - containerPort: 8080
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 📝 Best Practices Checklist

✅ Multi-stage build for minimal image size  
✅ Alpine Linux base images  
✅ Non-root user for security  
✅ Health checks enabled  
✅ Security headers configured  
✅ Static asset caching  
✅ Gzip compression  
✅ .dockerignore to exclude unnecessary files  
✅ Layer optimization for caching  
✅ Clean npm install without dev dependencies  

## 🆘 Support

For issues or questions:
1. Check container logs: `docker logs timor-inss-frontend`
2. Verify nginx configuration: `docker exec timor-inss-frontend nginx -t`
3. Check application health: `curl http://localhost:8080/health`

