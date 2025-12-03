# Nginx Configuration

This document describes the Nginx configuration for SynchBoard in Docker development and production deployment scenarios.

## Overview

SynchBoard uses two Nginx configurations:
1. **Docker Development** (`frontend/nginx.conf`) - Frontend container serving SPA and proxying to backend
2. **Production Server** (`server-config/synchboard.conf`) - External Nginx with SSL termination

## Docker Development Configuration

Located at `frontend/nginx.conf`, used in the Docker Compose setup.

### Server Settings

```nginx
listen 80;
server_name localhost;
root /usr/share/nginx/html;
index index.html;
```

### Security Headers

Applied globally to all responses:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `Permissions-Policy` | Disable geolocation, camera, etc. | Restrict browser APIs |
| `Content-Security-Policy` | See below | XSS protection |
| `Strict-Transport-Security` | `max-age=63072000` | Force HTTPS |

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://accounts.google.com;
style-src 'self' 'unsafe-inline' https://accounts.google.com;
img-src 'self' data: blob: https://*.googleusercontent.com;
font-src 'self';
connect-src 'self' wss://synchboard.com https://synchboard.com https://accounts.google.com;
frame-src https://accounts.google.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self' https://accounts.google.com;
```

### Caching Strategy

| Location | Cache Duration | Headers |
|----------|----------------|---------|
| JS/CSS/Fonts | 1 year | `public, immutable` |
| Images/SVGs | 7 days | `public, must-revalidate` |
| index.html | Never | `no-store, no-cache` |
| SPA routes | Never | `no-store, no-cache` |
| Uploaded images | 30 days | `public, no-transform` |

Vite adds content hashes to JS/CSS filenames, enabling aggressive caching.

### Proxy Locations

#### API Proxy

```nginx
location /api {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

#### WebSocket Proxy

```nginx
location /ws {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    # Long timeouts for persistent connections
    proxy_connect_timeout 7d;
    proxy_send_timeout 7d;
    proxy_read_timeout 7d;
}
```

#### OAuth2 Endpoints

```nginx
# Authorization initiation
location /oauth2/ {
    proxy_pass http://backend:8080;
}

# Callback from Google
location /login/oauth2/ {
    proxy_pass http://backend:8080;
}

# Frontend-initiated callback (path translation)
location /api/login/oauth2/ {
    proxy_pass http://backend:8080/login/oauth2/;
}
```

#### Uploaded Images

```nginx
location /images/ {
    root /usr/share/nginx/html;
    try_files $uri $uri/ =404;
    expires 30d;
}
```

Images are served directly from the shared Docker volume.

#### SPA Catch-All

```nginx
location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

All non-matched routes serve `index.html` for client-side routing.

### Performance Settings

```nginx
sendfile on;
tcp_nopush on;
tcp_nodelay on;
keepalive_timeout 65;
worker_connections 1024;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript
           application/javascript application/json
           application/xml+rss image/svg+xml;
```

## Production Server Configuration

Located at `server-config/synchboard.conf`, for external Nginx with SSL.

### SSL Configuration

```nginx
server {
    listen 443 ssl;
    server_name synchboard.com www.synchboard.com;

    ssl_certificate /etc/letsencrypt/live/synchboard.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/synchboard.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

Certificates managed by Certbot/Let's Encrypt.

### HTTP to HTTPS Redirect

```nginx
server {
    listen 80;
    server_name synchboard.com www.synchboard.com;

    if ($host = www.synchboard.com) {
        return 301 https://$host$request_uri;
    }
    if ($host = synchboard.com) {
        return 301 https://$host$request_uri;
    }
    return 404;
}
```

### Proxy to Docker

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Long timeouts for WebSocket
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    keepalive_timeout 3600s;
}
```

All traffic proxied to Docker frontend container on port 8080.

### Security Headers (Production)

Same headers as Docker configuration, applied at server level.

## Architecture Diagram

```
Internet
    │
    ▼
┌─────────────────────────────┐
│  External Nginx (Port 443)  │  ← SSL termination
│  synchboard.conf            │  ← Certbot certificates
└─────────────┬───────────────┘
              │
              ▼ http://127.0.0.1:8080
┌─────────────────────────────┐
│  Docker Frontend (Port 80)  │  ← Maps to host 8080
│  nginx.conf                 │
├─────────────────────────────┤
│  /api/*    → backend:8080   │
│  /ws       → backend:8080   │
│  /images/* → volume         │
│  /*        → index.html     │
└─────────────────────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Docker Backend (Port 8080) │
│  Spring Boot                │
└─────────────────────────────┘
```

## Key Differences

| Aspect | Docker Dev | Production |
|--------|------------|------------|
| SSL | None | Let's Encrypt |
| Port | 80 | 443 |
| Backend | Docker network | localhost |
| Images | Shared volume | Via Docker |
| Timeouts | 7d WebSocket | 3600s all |

## Troubleshooting

### WebSocket Connection Fails

- Check `Upgrade` and `Connection` headers are set
- Verify timeout values are sufficient
- Check firewall allows WebSocket connections

### OAuth2 Redirects Fail

- Verify all `/oauth2/` and `/login/oauth2/` locations configured
- Check `X-Forwarded-*` headers are passed
- Ensure `GOOGLE_REDIRECT_URI` matches actual callback URL

### Images Not Loading

- Verify volume mounted at `/usr/share/nginx/html/images`
- Check file permissions in volume
- Verify `try_files` directive

### Cache Issues

- Clear browser cache for development
- Verify `index.html` has `no-cache` headers
- Check Vite build produces hashed filenames

## Files

| File | Purpose |
|------|---------|
| `frontend/nginx.conf` | Docker container configuration |
| `server-config/synchboard.conf` | Production server configuration |
