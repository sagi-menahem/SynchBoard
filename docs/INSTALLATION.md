# Installation Guide

This guide provides detailed installation instructions for developers who want to set up SynchBoard for local development or production deployment.

---

## Production Deployment (VPS)

This section covers deploying SynchBoard to a production VPS environment with SSL/TLS encryption and proper security configurations.

### Prerequisites

- **VPS Server**: Ubuntu 22.04+ (or similar Linux distribution)
- **Docker**: Docker Engine 24+ and Docker Compose v2
- **Nginx**: Installed on the host machine (not containerized)
- **Domain**: A registered domain pointing to your server's IP address
- **SSH Keys**: GitHub SSH key configured on the server for repository access

### Architecture Overview

In production, the architecture differs from local development:

```
Internet → Nginx (Host) → Docker Network → Services
                ↓
         Port 443 (HTTPS)
         Port 80 (HTTP redirect)
                ↓
         Proxy to localhost:8080
                ↓
         ┌─────────────────────────────────────┐
         │     Docker Internal Network         │
         │  ┌─────────┐  ┌─────────┐          │
         │  │ Backend │←→│ Frontend│          │
         │  │ :8080   │  │ (Nginx) │          │
         │  └────┬────┘  └─────────┘          │
         │       ↓                             │
         │  ┌─────────┐  ┌─────────┐          │
         │  │PostgreSQL│  │ActiveMQ │          │
         │  │ :5432   │  │ :61613  │          │
         │  └─────────┘  └─────────┘          │
         └─────────────────────────────────────┘
```

**Key Security Features:**

- `docker-compose.prod.yml` removes all external port bindings for PostgreSQL, ActiveMQ, and the backend
- Only the frontend Nginx container exposes port 8080 to the host
- Host Nginx handles SSL termination and proxies requests to the Docker network

### Step 1: Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL certificates
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Clone Repository

```bash
# Navigate to deployment directory
cd /root  # or your preferred location

# Clone using SSH (requires SSH key configured with GitHub)
git clone git@github.com:sagi-menahem/SynchBoard.git
cd SynchBoard

# Set executable permissions
chmod +x backend/gradlew
chmod +x deploy.sh
```

### Step 3: Configure Environment

```bash
# Create production environment file
cp .env.example .env
nano .env
```

**Critical Production Settings:**

```bash
# Generate a secure JWT secret (required!)
JWT_SECRET_KEY=$(openssl rand -base64 64)

# Update URLs for your domain
CLIENT_ORIGIN_URL=https://yourdomain.com
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/login/oauth2/code/google
OAUTH2_FRONTEND_BASE_URL=https://yourdomain.com

# Use strong database credentials
POSTGRES_PASSWORD=<generate-strong-password>
ACTIVEMQ_PASSWORD=<generate-strong-password>

# Configure email (optional but recommended for production)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Step 4: Configure Nginx

The repository includes a production Nginx configuration at `server-config/synchboard.conf`.

```bash
# Create symlink to enable the site
sudo ln -s /root/SynchBoard/server-config/synchboard.conf /etc/nginx/sites-enabled/synchboard.conf

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Update server_name in the config to match your domain
sudo nano /root/SynchBoard/server-config/synchboard.conf
# Change: server_name synchboard.com www.synchboard.com;
# To:     server_name yourdomain.com www.yourdomain.com;

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: Obtain SSL Certificate

```bash
# Obtain certificate (Certbot will auto-configure Nginx)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot automatically:
# - Obtains Let's Encrypt certificate
# - Updates Nginx config with SSL settings
# - Sets up auto-renewal
```

### Step 6: Initial Deployment

```bash
# Build and start all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Verify services are running
docker compose ps

# Check logs if needed
docker compose logs -f backend
```

### Step 7: Automated Updates with deploy.sh

The `deploy.sh` script automates the update process:

```bash
# Make the script executable (if not already)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

**What `deploy.sh` does:**

1. Navigates to `/root/SynchBoard`
2. Reverts any local file changes (`git checkout .`)
3. Pulls the latest code from GitHub
4. Sets executable permissions on scripts
5. Rebuilds and restarts Docker containers with production overrides
6. Reloads Nginx to apply any configuration changes

### Understanding docker-compose.prod.yml

The production override file enhances security by removing external port bindings:

```yaml
services:
  postgres:
    ports: !reset [] # Removes port 5432 exposure

  activemq:
    ports: !reset [] # Removes ports 8161, 61616, 61613 exposure

  backend:
    ports: !reset [] # Backend only accessible via Docker network
```

This ensures:

- PostgreSQL is not accessible from the internet
- ActiveMQ management console is not exposed
- All traffic must flow through the host Nginx reverse proxy

### Nginx Configuration Details

The `server-config/synchboard.conf` provides:

- **SSL/TLS termination** with Let's Encrypt certificates
- **WebSocket support** via Upgrade headers (required for real-time features)
- **Reverse proxy** to Docker containers on localhost:8080
- **HTTP to HTTPS redirect** for all traffic
- **Extended timeouts** (3600s) for long-lived WebSocket connections

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (for Let's Encrypt and redirect)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Maintenance Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only

# Restart services
docker compose restart

# Stop all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Full rebuild (after major changes)
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Renew SSL certificate (usually automatic)
sudo certbot renew
```

### Troubleshooting Production

**502 Bad Gateway:**

- Verify Docker containers are running: `docker compose ps`
- Check backend logs: `docker compose logs backend`
- Ensure Nginx can reach localhost:8080

**WebSocket Connection Failed:**

- Verify Nginx has WebSocket headers configured
- Check browser console for connection errors
- Ensure firewall allows port 443

**SSL Certificate Issues:**

- Run `sudo certbot renew --dry-run` to test renewal
- Check certificate expiration: `sudo certbot certificates`

---

## Local Development Mode

For development and debugging with IDE support.

**Prerequisites:**

- PostgreSQL 17+ running locally
- ActiveMQ Artemis 2.37+ running locally
- Java 24+ and Node.js 20+

```bash
# 1. Set up infrastructure (using Docker for databases only)
docker-compose up -d postgres activemq

# 2. Configure backend
cd backend
cp .env.example .env
# Edit .env with your credentials (OAuth, SendGrid, etc.)
./gradlew bootRun  # Or run from IDE with -Dspring.profiles.active=dev

# 3. Configure frontend (in new terminal)
cd frontend
npm install
npm run dev

# 4. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
```

## 📝 Configuration Notes

- **Environment Files**:
  - Root `.env` - Used by Docker Compose for production deployment
  - `backend/.env` - Used by Spring Boot for local development
- **OAuth2 Setup**:
  - Development: OAuth redirects to `http://localhost:8080/login/oauth2/code/google`
  - Docker/Production: OAuth redirects to `http://localhost/api/login/oauth2/code/google`
  - Both URIs must be added to Google Cloud Console
- **Email Features**: Optional. Leave `SENDGRID_API_KEY` empty to disable email verification
- **Google Login**: Optional. Leave `GOOGLE_CLIENT_ID` empty to disable OAuth2
- **Default Credentials**: The `.env.example` includes working defaults for development
- **Security**: Never use the default `JWT_SECRET_KEY` in production!

### 🔧 Feature Availability

The application gracefully handles missing API keys:

- Without SendGrid: Registration works without email verification
- Without Google OAuth: Traditional email/password login only
- Check `/api/config/features` to see which features are enabled

## 🏗️ Architecture

### Technology Stack

**Backend:**

- Java 24 with Spring Boot 3.5.5
- Spring Security with JWT authentication
- Spring WebSocket with STOMP protocol
- PostgreSQL 17 for data persistence
- ActiveMQ Artemis for message brokering
- SendGrid for email services
- OAuth2 with Google provider

**Frontend:**

- React 19.2.0 with TypeScript 5.9.2
- Vite 7.2.4 build tool
- SCSS modules for styling
- @stomp/stompjs for WebSocket communication
- React Router for navigation
- i18next for internationalization
- Axios for HTTP requests

**Infrastructure:**

- Docker & Docker Compose for containerization
- Nginx for serving frontend and proxying API requests
- Multi-stage Docker builds for optimized images

## 📁 Project Structure

```
synchboard/
├── backend/                   # Spring Boot backend application
│   ├── src/                  # Source code
│   ├── build.gradle          # Gradle build configuration
│   └── Dockerfile            # Backend container configuration
├── frontend/                  # React frontend application
│   ├── src/                  # Source code
│   ├── package.json          # NPM dependencies
│   ├── nginx.conf            # Nginx configuration for Docker container
│   └── Dockerfile            # Frontend container configuration
├── server-config/             # Host server configuration files
│   └── synchboard.conf       # Nginx reverse proxy config (SSL, WebSocket)
├── docs/                      # Documentation
│   ├── INSTALLATION.md       # This file
│   └── API_DOCUMENTATION.md  # REST API reference
├── docker-compose.yml         # Docker services orchestration (development)
├── docker-compose.prod.yml    # Production overrides (secured ports)
├── deploy.sh                  # Automated deployment script for VPS
├── .env.example              # Environment variables template
└── README.md                 # Project overview
```

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. See `.env.example` for all available options:

- **Database**: PostgreSQL connection settings
- **Message Broker**: ActiveMQ configuration
- **JWT Security**: Secret key for token signing
- **Email Service**: SendGrid API configuration (optional)
- **OAuth2**: Google OAuth credentials (optional)

### Frontend Build Variables

The frontend uses Vite build-time environment variables that are baked into the static build:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | Base URL for API requests |
| `VITE_WEBSOCKET_URL` | `/ws` | WebSocket endpoint path |
| `VITE_GOOGLE_CLIENT_ID` | - | Google OAuth client ID for One Tap |

**Important Notes:**

- These variables are set as Docker build arguments in `docker-compose.yml`
- Changes require rebuilding the frontend container (not just restarting)
- In Docker, relative paths (`/api`, `/ws`) work because Nginx proxies to backend
- For local development without Docker, the frontend uses `http://localhost:8080` directly

**Docker Configuration:**

```yaml
# docker-compose.yml
frontend:
  build:
    args:
      VITE_API_BASE_URL: /api
      VITE_WEBSOCKET_URL: /ws
      VITE_GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
```

**Local Development:**

When running frontend with `npm run dev` (outside Docker), API calls go to `http://localhost:8080` via Vite's proxy configuration in `vite.config.ts`.

### Default Credentials

For development/testing with default configuration:

- PostgreSQL: `synchboard_user` / `test12345`
- ActiveMQ: `admin` / `admin`
- pgAdmin: `admin@synchboard.local` / `admin`

## 🛠️ Development

### Running Without Docker

**Backend:**

```bash
cd backend
./gradlew bootRun  # Unix/Mac
gradlew.bat bootRun # Windows
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Available Scripts

**Backend:**

- `./gradlew test` - Run tests
- `./gradlew build` - Build the application
- `./gradlew bootJar` - Create executable JAR

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

**Root Level:**

- `npm run format:all` - Format entire project
- `npm run build:backend` - Build backend
- `npm run build:frontend` - Build frontend

## 🐛 Troubleshooting

**Port Conflicts:**

- Ensure ports 80, 8080, 5432, 61613, 61616, 8161 are free
- Modify port mappings in `.env` if needed

**Docker Issues:**

- Run `docker-compose down -v` to clean up volumes
- For complete rebuild after configuration changes:
  ```bash
  docker-compose down -v --rmi all  # Remove containers, volumes, AND images
  docker-compose up --build         # Rebuild everything from scratch
  ```
- For quick rebuild without removing volumes: `docker-compose build --no-cache`
- View backend logs: `docker logs -f synchboard-backend`

**Database Connection:**

- Verify PostgreSQL is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

**OAuth2 Authentication:**

- Ensure redirect URIs are configured in Google Cloud Console for your environment:
  - Local Development: `http://localhost:8080/login/oauth2/code/google`
  - Docker Development: `http://localhost/api/login/oauth2/code/google`
  - Production: `https://yourdomain.com/api/login/oauth2/code/google`
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Clear browser cookies if authentication fails after configuration changes

**Backend Logging:**

- Docker: Logs visible with `docker logs synchboard-backend`
- Development: Logs appear in console when using `spring.profiles.active=dev`
