# Proxy Configuration Guide

## Overview
This project uses an Angular proxy configuration to redirect API calls to the backend server during development. This helps avoid CORS issues.

## Configuration Files

### 1. `proxy.conf.json`
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

**Settings explained:**
- `target`: The backend API server URL
- `secure`: Set to `false` for HTTP (use `true` for HTTPS)
- `changeOrigin`: Changes the origin header to match the target URL
- `logLevel`: Set to `debug` to see proxy requests in the console

### 2. `environment.ts`
Uses relative paths that will be proxied:
```typescript
apiUrl: '/api',
apiImportsUrl: '/api/imports',
```

### 3. `package.json`
Updated start script to use proxy:
```json
"start": "ng serve --proxy-config proxy.conf.json"
```

## How It Works

When you run `npm start`:
1. Angular dev server starts with proxy configuration
2. All requests to `/api/*` are intercepted
3. Requests are forwarded to `http://fin.timorniss.online:5000/api/*`
4. Responses are sent back to your Angular app

**Example:**
- Your app requests: `http://localhost:4200/api/users`
- Proxy forwards to: `http://fin.timorniss.online:5000/api/users`
- Response comes back to your app

## Usage

### Start with Proxy (Default)
```bash
npm start
```
or
```bash
npm start -- --port 4203
```

### Start without Proxy
```bash
npm run start-no-proxy
```

## Troubleshooting

### See Proxy Logs
The `logLevel: "debug"` setting will show proxy requests in your terminal:
```
[HPM] GET /api/users -> http://fin.timorniss.online:5000
```

### Common Issues

1. **CORS errors persist**
   - Make sure the proxy configuration is loaded (check terminal output)
   - Verify the target URL is correct
   - Restart the dev server after changing proxy config

2. **404 errors**
   - Check that your API endpoint exists on the backend
   - Verify the path mapping in proxy.conf.json

3. **Connection refused**
   - Verify the backend server is running
   - Check the target URL and port
   - Ensure firewall allows the connection

## Production Build

Note: The proxy configuration only works in development. For production:
- Update `environment.prod.ts` with the actual API URL
- Configure CORS on your backend server
- Or use a reverse proxy (nginx, Apache, etc.)

## Changing the Target Server

To change the API server, edit `proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://your-new-server.com:port",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Then restart the dev server.

