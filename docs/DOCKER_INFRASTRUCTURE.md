# Docker Infrastructure

This document describes the Docker Compose setup for SynchBoard, including services, volumes, networking, and deployment configurations.

## Services Overview

| Service  | Image                          | Purpose                  | Port               |
| -------- | ------------------------------ | ------------------------ | ------------------ |
| postgres | postgres:17-alpine             | Database                 | 5432               |
| activemq | apache/activemq-artemis:2.37.0 | Message broker           | 8161, 61613, 61616 |
| backend  | Custom (Spring Boot)           | REST API, WebSocket      | 8080               |
| frontend | Custom (Nginx)                 | SPA, proxy               | 80                 |
| pgadmin  | dpage/pgadmin4                 | DB management (optional) | 5050               |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   synchboard-network                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│  │ postgres│    │activemq │    │ backend │              │
│  │  :5432  │◄── │ :61613  │◄───│  :8080  │              │
│  └─────────┘    │ :61616  │    └────▲────┘              │
│       ▲         └─────────┘         │                   │
│       │                             │                   │
│       │         ┌───────────────────┘                   │
│       │         │                                       │
│       │    ┌────┴────┐                                  │
│       └────│frontend │                                  │
│            │  :80    │◄─── External traffic             │
│            └─────────┘                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Service Details

### PostgreSQL

```yaml
postgres:
  image: postgres:17-alpine
  environment:
    POSTGRES_DB: ${POSTGRES_DB}
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./backend/sql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
  healthcheck:
    test: pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}
```

- Uses Alpine-based image for smaller footprint
- Initialization SQL runs on first startup
- Health check ensures readiness before backend starts

### ActiveMQ Artemis

```yaml
activemq:
  image: apache/activemq-artemis:2.37.0
  environment:
    ARTEMIS_USER: ${ACTIVEMQ_USER}
    ARTEMIS_PASSWORD: ${ACTIVEMQ_PASSWORD}
    ANONYMOUS_LOGIN: false
  ports:
    - '8161:8161' # Web console
    - '61616:61616' # TCP (OpenWire)
    - '61613:61613' # STOMP
```

- STOMP protocol used for WebSocket relay
- Web console available at http://localhost:8161

### Backend (Spring Boot)

Multi-stage Dockerfile:

```dockerfile
# Build stage
FROM eclipse-temurin:24-jdk-alpine AS builder
WORKDIR /app
COPY gradlew gradle build.gradle settings.gradle ./
RUN ./gradlew dependencies --no-daemon
COPY src ./src
RUN ./gradlew bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:24-jre-alpine
RUN addgroup -g 1000 spring && adduser -D -u 1000 -G spring spring
WORKDIR /app
RUN mkdir -p /app/uploads /app/logs && chown -R spring:spring /app
COPY --from=builder /app/build/libs/*.jar app.jar
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "--add-opens=java.base/sun.misc=ALL-UNNAMED", "-jar", "app.jar"]
```

Features:

- Multi-stage build reduces image size
- Non-root user for security
- Dependencies cached in separate layer
- JVM flags for Java 24 compatibility

### Frontend (Nginx)

Multi-stage Dockerfile:

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
ARG VITE_API_BASE_URL=/api
ARG VITE_WEBSOCKET_URL=/ws
ARG VITE_GOOGLE_CLIENT_ID
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

Build arguments baked into static files at build time.

## Volumes

| Volume            | Container Path              | Purpose              |
| ----------------- | --------------------------- | -------------------- |
| `postgres_data`   | `/var/lib/postgresql/data`  | Database persistence |
| `activemq_data`   | `/var/lib/artemis-instance` | Message broker state |
| `backend_uploads` | `/app/uploads`              | File uploads         |
| `backend_logs`    | `/app/logs`                 | Application logs     |
| `pgadmin_data`    | `/var/lib/pgadmin`          | pgAdmin config       |

The `backend_uploads` volume is shared with frontend (read-only) for direct image serving.

## Environment Variables

### Required

| Variable            | Description                    |
| ------------------- | ------------------------------ |
| `POSTGRES_DB`       | Database name                  |
| `POSTGRES_USER`     | Database username              |
| `POSTGRES_PASSWORD` | Database password              |
| `ACTIVEMQ_USER`     | Broker username                |
| `ACTIVEMQ_PASSWORD` | Broker password                |
| `JWT_SECRET_KEY`    | JWT signing key (min 32 chars) |

### Optional

| Variable               | Default            | Description                  |
| ---------------------- | ------------------ | ---------------------------- |
| `JPA_DDL_AUTO`         | `update`           | Schema management            |
| `JWT_EXPIRATION_HOURS` | `24`               | Token lifetime               |
| `CLIENT_ORIGIN_URL`    | `http://localhost` | CORS origin                  |
| `GMAIL_CLIENT_ID`      | -                  | Gmail API OAuth2 client ID   |
| `GMAIL_CLIENT_SECRET`  | -                  | Gmail API OAuth2 secret      |
| `GMAIL_REFRESH_TOKEN`  | -                  | Gmail API OAuth2 refresh token |
| `GMAIL_SENDER_EMAIL`   | -                  | Gmail sender address         |
| `GOOGLE_CLIENT_ID`     | -                  | Google login OAuth2 client   |
| `GOOGLE_CLIENT_SECRET` | -                  | Google login OAuth2 secret   |
| `MAX_FILE_SIZE_MB`     | `10`               | Upload limit                 |

### Port Bindings

| Variable              | Default | Description    |
| --------------------- | ------- | -------------- |
| `POSTGRES_PORT`       | `5432`  | Database port  |
| `ACTIVEMQ_WEB_PORT`   | `8161`  | Broker console |
| `ACTIVEMQ_STOMP_PORT` | `61613` | STOMP port     |
| `BACKEND_PORT`        | `8080`  | Backend API    |
| `FRONTEND_BINDING`    | `80:80` | Frontend       |
| `PGADMIN_PORT`        | `5050`  | pgAdmin        |

## Commands

### Development

```bash
# Start all services
docker-compose up --build

# Start with pgAdmin
docker-compose --profile tools up

# Start infrastructure only (for IDE debugging)
docker-compose up -d postgres activemq

# View logs
docker-compose logs -f backend

# Rebuild single service
docker-compose up --build backend
```

### Production

```bash
# Build and deploy (secured ports)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Full cleanup
docker-compose down -v --rmi all
```

The production override (`docker-compose.prod.yml`) removes external port bindings for postgres, activemq, and backend, exposing only the frontend.

## Production Configuration

`docker-compose.prod.yml`:

```yaml
services:
  postgres:
    ports: !reset []
  activemq:
    ports: !reset []
  backend:
    ports: !reset []
```

This removes external port exposure, making services accessible only within the Docker network.

## Health Checks

| Service  | Check              | Interval | Start Period |
| -------- | ------------------ | -------- | ------------ |
| postgres | `pg_isready`       | 10s      | -            |
| activemq | HTTP :8161         | 30s      | -            |
| backend  | `/actuator/health` | 30s      | 60s          |
| frontend | HTTP :80           | 30s      | 5s           |

Backend depends on postgres and activemq being healthy before starting.

## Network

All services join `synchboard-network` (bridge driver):

```yaml
networks:
  synchboard-network:
    name: synchboard_network
    driver: bridge
```

Internal DNS resolves service names (e.g., `postgres`, `backend`).

## Build Arguments

Frontend build arguments (set in docker-compose.yml):

| Argument                | Value                 | Description         |
| ----------------------- | --------------------- | ------------------- |
| `VITE_API_BASE_URL`     | `/api`                | API endpoint prefix |
| `VITE_WEBSOCKET_URL`    | `/ws`                 | WebSocket endpoint  |
| `VITE_GOOGLE_CLIENT_ID` | `${GOOGLE_CLIENT_ID}` | OAuth client ID     |

These are baked into the static build and cannot be changed at runtime.

## Troubleshooting

### Backend won't start

1. Check postgres and activemq health: `docker-compose ps`
2. View backend logs: `docker-compose logs backend`
3. Verify environment variables in `.env`

### Database connection failed

1. Ensure postgres is healthy
2. Check `DB_URL` uses Docker service name: `postgres:5432`
3. Verify credentials match between services

### WebSocket connection refused

1. Ensure activemq is healthy
2. Check STOMP port (61613) is accessible
3. Verify `STOMP_BROKER_HOST=activemq`

### Images not loading

1. Verify `backend_uploads` volume is shared
2. Check frontend mount is read-only at `/usr/share/nginx/html/images`
3. Verify file permissions in volume

### Build cache issues

```bash
# Force rebuild without cache
docker-compose build --no-cache

# Remove all images and volumes
docker-compose down -v --rmi all
```

## Files

| File                      | Purpose               |
| ------------------------- | --------------------- |
| `docker-compose.yml`      | Main configuration    |
| `docker-compose.prod.yml` | Production overrides  |
| `backend/Dockerfile`      | Backend build         |
| `frontend/Dockerfile`     | Frontend build        |
| `.env`                    | Environment variables |
| `.env.example`            | Variable template     |
