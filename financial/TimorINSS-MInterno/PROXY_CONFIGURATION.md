# 🔀 Proxy Configuration Guide

This document explains how API proxying works in development vs production.

## 📋 Overview

Your application uses **different proxy configurations** depending on the environment:

| Environment | Proxy Handler | Configuration File |
|-------------|---------------|-------------------|
| **Development** (`ng serve`) | Angular Dev Server | `proxy.conf.json` |
| **Production** (Docker/nginx) | nginx | `nginx-default.conf` |

## 🛠️ Development (Local)

### Configuration: `proxy.conf.json`

```json
{
  "/api": {
    "target": "http://fin.timorniss.online:5000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### How It Works

1. You start the dev server: `npm start`
2. Angular dev server runs on `http://localhost:4200`
3. Any request to `http://localhost:4200/api/*` is proxied to `http://fin.timorniss.online:5000/api/*`
4. The browser never knows about the real backend server

### Example Flow

```
Browser Request:
http://localhost:4200/api/utilizadores/GetAllUtilizadores

       ↓ (Angular Dev Server proxies)

Backend Request:
http://fin.timorniss.online:5000/api/utilizadores/GetAllUtilizadores
```

## 🐳 Production (Docker)

### Configuration: `nginx-default.conf`

```nginx
location /api {
    proxy_pass http://fin.timorniss.online:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

### How It Works

1. Docker container runs nginx on port `8080`
2. Angular app is built as static files (HTML/CSS/JS)
3. nginx serves static files AND proxies API requests
4. Any request to `http://localhost:8080/api/*` is proxied to `http://fin.timorniss.online:5000/api/*`

### Example Flow

```
Browser Request:
http://localhost:8080/api/utilizadores/GetAllUtilizadores

       ↓ (nginx proxies)

Backend Request:
http://fin.timorniss.online:5000/api/utilizadores/GetAllUtilizadores
```

## 🔑 Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| Server | Angular Dev Server | nginx |
| Config File | `proxy.conf.json` | `nginx-default.conf` |
| Port | 4200 | 8080 (in Docker) |
| Hot Reload | ✅ Yes | ❌ No (must rebuild) |
| Build | Not built | Built & optimized |

## ⚙️ Environment Configuration

### `src/environments/environment.ts` (Development)

```typescript
export const environment = {
  production: false,
  // Relative path - proxied by Angular dev server
  apiUrl: '/api',
  apiImportsUrl: '/api/imports',
  // ...
};
```

### `src/environments/environment.prod.ts` (Production)

```typescript
export const environment = {
  production: true,
  // Relative path - proxied by nginx
  apiUrl: '/api',
  apiImportsUrl: '/api/imports',
  // ...
};
```

**Note:** Both use relative paths (`/api`) because:
- In development: Angular dev server handles the proxy
- In production: nginx handles the proxy

## 🔧 How to Change Backend URL

### If Backend URL Changes

You need to update **BOTH** configurations:

#### 1. Update `proxy.conf.json` (for development)

```json
{
  "/api": {
    "target": "http://NEW-BACKEND-URL:PORT",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

#### 2. Update `nginx-default.conf` (for production)

```nginx
location /api {
    proxy_pass http://NEW-BACKEND-URL:PORT;
    # ... rest of config
}
```

#### 3. Rebuild Docker

```bash
./docker-rebuild.sh
```

## 📊 Request Flow Diagrams

### Development Flow

```
┌─────────┐         ┌──────────────────┐         ┌─────────┐
│ Browser │────────▶│ Angular Dev      │────────▶│ Backend │
│         │ :4200   │ Server (ng serve)│ :5000   │ API     │
└─────────┘         └──────────────────┘         └─────────┘
                    ▲
                    │
                    proxy.conf.json
```

### Production Flow

```
┌─────────┐         ┌──────────────────┐         ┌─────────┐
│ Browser │────────▶│ nginx            │────────▶│ Backend │
│         │ :8080   │ (Docker)         │ :5000   │ API     │
└─────────┘         └──────────────────┘         └─────────┘
                    ▲
                    │
                    nginx-default.conf
```

## 🧪 Testing the Proxy

### Development

```bash
# Start dev server
npm start

# Test API proxy
curl http://localhost:4200/api/health

# Or in browser
open http://localhost:4200
# Open DevTools Console and check Network tab for API calls
```

### Production (Docker)

```bash
# Build and run
./docker-rebuild.sh

# Test API proxy
curl http://localhost:8080/api/health

# Or in browser
open http://localhost:8080
# Open DevTools Console and check Network tab for API calls
```

## ⚠️ Important Notes

1. **`proxy.conf.json` is NOT used in Docker**
   - It's only for development with `ng serve`
   - Production uses nginx configuration

2. **Both configs must match**
   - Same backend URL
   - Same path prefixes (`/api`)

3. **CORS is handled by proxy**
   - Browser sees requests to same origin
   - No CORS issues because proxy forwards requests

4. **After changing nginx config, rebuild Docker**
   ```bash
   ./docker-rebuild.sh
   ```

## 🔍 Debugging Proxy Issues

### Development

```bash
# Check if proxy.conf.json is loaded
# Look for this in terminal when running npm start:
# "Proxy config file proxy.conf.json detected"

# Enable verbose logging
# Already enabled: "logLevel": "debug"
```

### Production

```bash
# Check nginx logs
docker logs -f timor-inss-frontend

# Test nginx config
docker exec timor-inss-frontend nginx -t

# Check if backend is reachable FROM container
docker exec timor-inss-frontend wget -O- http://fin.timorniss.online:5000/api/health
```

## ✅ Verification Checklist

- [ ] `proxy.conf.json` has correct backend URL
- [ ] `nginx-default.conf` has correct backend URL
- [ ] Both configs use same path prefix (`/api`)
- [ ] `environment.ts` uses relative paths (`/api`)
- [ ] `environment.prod.ts` uses relative paths (`/api`)
- [ ] Docker container rebuilt after nginx config changes
- [ ] API calls work in development
- [ ] API calls work in production (Docker)

## 📚 Additional Resources

- [Angular Proxy Config](https://angular.dev/tools/cli/serve#proxying-to-a-backend-server)
- [nginx Proxy Module](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

