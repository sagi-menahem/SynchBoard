# Performance Optimizations

This document describes performance optimizations implemented in SynchBoard across frontend, backend, and infrastructure layers.

## Frontend Optimizations

### Code Splitting

**Route-based Lazy Loading** (`AppRoutes.tsx`):

- All pages use `React.lazy()` for dynamic imports
- Reduces initial bundle size significantly

**Manual Chunk Splitting** (`vite.config.ts`):

| Chunk           | Contents              | Cache Strategy     |
| --------------- | --------------------- | ------------------ |
| `react-vendor`  | React, ReactDOM       | Long-term (stable) |
| `react-router`  | React Router          | Long-term          |
| `ui-components` | Radix UI, Headless UI | Long-term          |
| `ui-vendor`     | Toast, Color picker   | Medium-term        |
| `i18n-vendor`   | i18next               | Long-term          |
| `utils-vendor`  | Axios, JWT            | Long-term          |
| `icons-vendor`  | Lucide icons          | Long-term          |

**WebSocket Lazy Loading** (`websocketService.ts`):

```typescript
// Only loaded after authentication
const stompModule = await import('@stomp/stompjs');
```

Reduces initial bundle by ~100KB on auth pages.

### Canvas Optimization

**Point Decimation** (`CanvasUtils.ts`):

```typescript
// Configuration
OPTIMIZATION: {
  ENABLED: true,
  MIN_POINTS_THRESHOLD: 15,  // Only optimize 15+ points
  DECIMATION_FACTOR: 2,       // Keep every 2nd point
  PRESERVE_ENDPOINTS: true    // Keep start/end
}
```

Benefits:

- 50% reduction in brush stroke data
- Faster WebSocket transmission
- Less memory usage

**Canvas Context Setup**:

```typescript
getContext('2d', { willReadFrequently: true });
```

Optimizes for frequent pixel data reads (color picker, hit detection).

### Memoization

- **`useMemo`**: Used in 65+ files for computed values
- **`useCallback`**: Used for stable function references
- **`React.memo`**: Used for pure components
- **`useDebounce`**: Prevents API flooding

Example debounce usage:

```typescript
const debouncedSave = useDebouncedCallback(saveCanvas, 500);
```

## Backend Optimizations

### Database Queries

**JOIN FETCH Strategy** - Prevents N+1 queries:

```java
// GroupMemberRepository
@Query(
  "SELECT gm FROM GroupMember gm " +
  "JOIN FETCH gm.groupBoard gb " +
  "WHERE gm.userEmail = :userEmail " +
  "ORDER BY gb.lastModifiedDate DESC"
)
List<GroupMember> findByUserWithBoard(String userEmail);
```

All repositories use JOIN FETCH for related entities:

- `GroupMemberRepository`: Board + User relations
- `BoardObjectRepository`: Creator + Editor relations
- `ActionHistoryRepository`: Board + Object + User relations
- `MessageRepository`: Sender relation

### Lazy Loading

All JPA entities use lazy fetch:

```java
@ManyToOne(fetch = FetchType.LAZY)
private GroupBoard board;
```

Combined with JOIN FETCH in queries, this ensures:

- No unnecessary entity loading
- Explicit control over fetched data

### Transaction Management

```java
@Transactional(readOnly = true)
public List<BoardDTO> getUserBoards(String email) { ... }
```

Read-only transactions skip dirty checking and flush operations.

### Configuration

```properties
# Disable open-in-view anti-pattern
spring.jpa.open-in-view=false
```

### Message Caching

```java
messageSource.setCacheSeconds(3600); // 1 hour cache
```

## WebSocket Optimizations

### Reconnection Strategy

**Exponential Backoff** (`websocketService.ts`):

```typescript
const delay = Math.min(
  baseDelay * Math.pow(2, attempts),
  30000, // Cap at 30 seconds
);
```

Configuration:

- Base delay: 2 seconds
- Max attempts: 5
- Max delay: 30 seconds

### Message Validation

```typescript
MAX_MESSAGE_SIZE: 480 * 1024; // 480KB limit
```

Schema validation for each message type:

- Required fields validation
- Content length limits
- XSS sanitization

### Pending Subscription Queue

Subscriptions queued during disconnection:

```typescript
private pendingSubscriptions: Map<string, PendingSubscription>;
```

Auto-resubscribes when connection restored.

### Heartbeat Configuration

```typescript
heartbeatIncoming: 10000,   // Server → client
heartbeatOutgoing: 10000    // Client → server
```

Keeps connections alive, detects failures quickly.

## Infrastructure Optimizations

### Docker Multi-Stage Builds

**Backend** (`backend/Dockerfile`):

```dockerfile
# Stage 1: Build (JDK)
FROM eclipse-temurin:24-jdk-alpine AS builder
RUN ./gradlew dependencies --no-daemon  # Cached layer
RUN ./gradlew bootJar --no-daemon

# Stage 2: Runtime (JRE only)
FROM eclipse-temurin:24-jre-alpine
COPY --from=builder /app/build/libs/*.jar app.jar
```

Benefits:

- Smaller final image (JRE vs JDK)
- Dependencies cached in separate layer
- Alpine base reduces size

**Frontend** (`frontend/Dockerfile`):

```dockerfile
# Stage 1: Build (Node)
FROM node:22-alpine AS builder
RUN npm ci --silent
RUN npm run build

# Stage 2: Runtime (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Nginx Caching

**Gzip Compression** (`nginx.conf`):

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript;
```

**Cache Headers**:

| Asset Type      | Cache Duration | Headers                   |
| --------------- | -------------- | ------------------------- |
| JS/CSS/Fonts    | 1 year         | `public, immutable`       |
| Images/SVGs     | 7 days         | `public, must-revalidate` |
| Uploaded images | 30 days        | `public, no-transform`    |
| index.html      | Never          | `no-store, no-cache`      |

Vite adds content hashes to filenames, enabling aggressive caching.

### Health Checks

| Service    | Check              | Interval |
| ---------- | ------------------ | -------- |
| Backend    | `/actuator/health` | 30s      |
| Frontend   | HTTP root          | 30s      |
| PostgreSQL | `pg_isready`       | 10s      |
| ActiveMQ   | HTTP :8161         | 30s      |

Dependencies wait for health before starting.

### Connection Configuration

```yaml
# ActiveMQ connection keeps alive
ACTIVEMQ_BROKER_URL: tcp://activemq:61616?wireFormat.maxInactivityDuration=0
```

Uses Docker DNS for internal service resolution.

## JVM Optimization

```bash
--add-opens=java.base/sun.misc=ALL-UNNAMED
-XX:+UnlockExperimentalVMOptions
-Djava.security.egd=file:/dev/./urandom
```

- Suppresses Java 24 deprecation warnings
- Faster entropy source for cryptography

## Configuration Constants

### Canvas (`BoardConstants.ts`)

| Setting                | Value | Purpose                |
| ---------------------- | ----- | ---------------------- |
| `MIN_POINTS_THRESHOLD` | 15    | Optimization threshold |
| `DECIMATION_FACTOR`    | 2     | Point reduction ratio  |
| `PRESERVE_ENDPOINTS`   | true  | Keep stroke ends       |

### WebSocket (`AppConstants.ts`)

| Setting                     | Value   | Purpose              |
| --------------------------- | ------- | -------------------- |
| `MAX_MESSAGE_SIZE`          | 480KB   | Size limit           |
| `MAX_RECONNECTION_ATTEMPTS` | 5       | Retry limit          |
| `BASE_RECONNECTION_DELAY`   | 2000ms  | Initial delay        |
| `TRANSACTION_TIMEOUT`       | 30000ms | Confirmation timeout |

### Timing (`TimingConstants.ts`)

| Setting                        | Value   | Purpose               |
| ------------------------------ | ------- | --------------------- |
| `CHAT_PENDING_MESSAGE_TIMEOUT` | 750ms   | Message optimistic UI |
| `CHAT_SCROLL_DELAY`            | 100ms   | Scroll debounce       |
| `WEBSOCKET_CONNECTION_TIMEOUT` | 10000ms | Connection timeout    |

## Summary

| Layer          | Optimization        | Impact                    |
| -------------- | ------------------- | ------------------------- |
| Frontend       | Lazy loading        | Smaller initial bundle    |
| Frontend       | Chunk splitting     | Better caching            |
| Frontend       | Point decimation    | 50% less drawing data     |
| Backend        | JOIN FETCH          | No N+1 queries            |
| Backend        | Lazy loading        | Load on demand            |
| WebSocket      | Exponential backoff | Prevents server overload  |
| WebSocket      | Message validation  | Security + memory         |
| Infrastructure | Multi-stage Docker  | Smaller images            |
| Infrastructure | Gzip                | 60-80% transfer reduction |
| Infrastructure | Caching headers     | Browser cache utilization |

## Key Files

| File                  | Optimizations           |
| --------------------- | ----------------------- |
| `vite.config.ts`      | Chunk splitting         |
| `websocketService.ts` | Lazy load, reconnection |
| `CanvasUtils.ts`      | Point decimation        |
| `*Repository.java`    | JOIN FETCH queries      |
| `nginx.conf`          | Compression, caching    |
| `Dockerfile`          | Multi-stage builds      |
