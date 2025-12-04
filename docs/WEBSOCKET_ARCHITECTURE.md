# WebSocket Architecture

This document describes the real-time communication system in SynchBoard, including STOMP messaging, connection management, and message protocols.

## Overview

SynchBoard uses WebSocket with STOMP protocol for real-time collaboration. The architecture consists of:

- **Frontend**: Singleton `WebSocketService` managing STOMP client lifecycle
- **Backend**: Spring WebSocket with ActiveMQ Artemis as external message broker
- **Security**: JWT authentication on STOMP CONNECT frames

## Connection Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. User authenticates → AuthContext provides JWT                   │
│  2. WebSocketProvider triggers connection                           │
│  3. Lazy-load @stomp/stompjs (reduces initial bundle)               │
│  4. websocketService.connect(token, callback)                       │
│  5. STOMP CONNECT with Authorization header → Server                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  6. JwtChannelInterceptor validates token                           │
│  7. ActiveMQ Artemis accepts connection                             │
│  8. Server sends CONNECTED frame                                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  9. onConnect callback fires                                        │
│ 10. Process pending subscriptions                                   │
│ 11. Components subscribe to topics                                  │
│ 12. Ready for real-time messaging                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Message Destinations

### Client → Server (Application Prefix: `/app`)

| Destination                       | Purpose                        | DTO                      |
| --------------------------------- | ------------------------------ | ------------------------ |
| `/app/board.drawAction`           | Canvas drawing operations      | `BoardActionDTO.Request` |
| `/app/chat.sendMessage`           | Chat messages                  | `ChatMessageDTO.Request` |
| `/app/board.canvasSettingsUpdate` | Canvas size/background changes | `CanvasSettingsDTO`      |

### Server → Client (Topic Prefix: `/topic`)

| Destination               | Purpose                       | DTO             |
| ------------------------- | ----------------------------- | --------------- |
| `/topic/board/{boardId}`  | Board updates, drawings, chat | Various         |
| `/topic/user/{userEmail}` | Personal notifications        | `UserUpdateDTO` |
| `/user/queue/errors`      | User-specific errors          | Error object    |

> **Note:** Backend sends errors via `messagingTemplate.convertAndSendToUser(email, "/topic/errors", ...)`. Spring STOMP automatically translates this to `/user/queue/errors` for the recipient.

## Message Formats

### Drawing Actions

**Request (`BoardActionDTO.Request`):**

```json
{
  "boardId": 123,
  "type": "OBJECT_ADD",
  "payload": {
    "x": 100,
    "y": 200,
    "width": 150,
    "height": 100,
    "strokeColor": "#000000",
    "fillColor": "#FFFFFF"
  },
  "instanceId": "uuid-v4"
}
```

**Response (`BoardActionDTO.Response`):**

```json
{
  "type": "OBJECT_ADD",
  "payload": {
    /* same as request payload */
  },
  "sender": "user@example.com",
  "instanceId": "uuid-v4"
}
```

**Action Types:**

- `OBJECT_ADD` - Create new canvas object
- `OBJECT_UPDATE` - Modify existing object
- `OBJECT_DELETE` - Remove object (soft delete)

### Chat Messages

**Request (`ChatMessageDTO.Request`):**

```json
{
  "content": "Hello team!",
  "boardId": 123,
  "instanceId": "uuid-v4"
}
```

**Response (`ChatMessageDTO.Response`):**

```json
{
  "id": 456,
  "type": "CHAT",
  "content": "Hello team!",
  "timestamp": "2025-01-15T10:30:00",
  "senderEmail": "user@example.com",
  "senderFullName": "John Doe",
  "senderProfilePictureUrl": "/uploads/avatar.jpg",
  "instanceId": "uuid-v4"
}
```

**Message Types:** `CHAT`, `JOIN`, `LEAVE`

### Board Updates

**`BoardUpdateDTO`:**

```json
{
  "updateType": "MEMBERS_UPDATED",
  "sourceUserEmail": "admin@example.com"
}
```

**Update Types:**

- `DETAILS_UPDATED` - Name, description, or picture changed
- `MEMBERS_UPDATED` - Members added or removed
- `CANVAS_UPDATED` - Canvas settings changed

### User Notifications

**`UserUpdateDTO`:**

```json
{
  "updateType": "BOARD_LIST_CHANGED"
}
```

**Update Types:**

- `BOARD_LIST_CHANGED` - User's board access modified
- `BOARD_DETAILS_CHANGED` - A board visible to user was updated

## Frontend Service

### Singleton Pattern

```typescript
// websocketService.ts
class WebSocketService {
  private stompClient: Client | null = null;
  private pendingSubscriptions: PendingSubscription[] = [];
  private rollbackCallbacks: Set<() => void> = new Set();
  // ...
}

export const websocketService = new WebSocketService();
```

### Key Methods

| Method                                   | Purpose                              |
| ---------------------------------------- | ------------------------------------ |
| `connect(token, callback)`               | Establish authenticated connection   |
| `disconnect()`                           | Clean disconnection with state reset |
| `subscribe(topic, callback, schemaKey?)` | Subscribe to STOMP topic             |
| `sendMessage(destination, body)`         | Publish message to destination       |
| `registerRollbackCallback(fn)`           | Register optimistic update rollback  |
| `registerQueueProcessor(fn)`             | Register offline message processor   |

### Connection States

```typescript
type ConnectionState = 'disconnected' | 'connecting' | 'connected';
```

- `getConnectionState()` - Returns current state
- `isConnected()` - Returns `true` only when fully connected and client active

### Pending Subscription Queue

Subscriptions made while disconnected are queued:

```typescript
pendingSubscriptions.push({ topic, callback, schemaKey });
// Processed automatically when connection established
```

## Reconnection Strategy

### Exponential Backoff Algorithm

```
delay = min(baseDelay × 2^attempt, maxDelay)

baseDelay = 2000ms
maxDelay = 30000ms (30 seconds)
maxAttempts = 5
```

**Example progression:**

1. Attempt 1: 2s delay
2. Attempt 2: 4s delay
3. Attempt 3: 8s delay
4. Attempt 4: 16s delay
5. Attempt 5: 30s delay (capped)

After 5 failed attempts, reconnection stops until user action.

## Optimistic Updates

### Pattern

1. Generate `instanceId` (UUID v4)
2. Apply change locally with `transactionStatus: 'pending'`
3. Send message via WebSocket
4. On server response, match by `instanceId` and commit
5. If connection lost, execute rollback callbacks

### Rollback Registration

```typescript
const cleanup = websocketService.registerRollbackCallback(() => {
  // Revert optimistic changes
  revertPendingObjects();
});

// Call cleanup() when no longer needed
```

## Message Validation

### Frontend Validation

Messages are validated before callback invocation:

```typescript
const schemas = {
  board: {},
  user: {
    requiredFields: ['updateType'],
    allowedTypes: ['BOARD_LIST_CHANGED', 'BOARD_DETAILS_CHANGED', 'CANVAS_SETTINGS_CHANGED'],
  },
  chat: {
    requiredFields: ['type', 'content', 'timestamp', 'senderEmail'],
    maxLength: 5000,
  },
};
```

### Security Checks

1. **Size limit**: 480 KB max message size
2. **Prototype pollution**: Blocks `__proto__`, `prototype`, `constructor.prototype`
3. **XSS sanitization**: Removes `<script>`, `<iframe>`, `javascript:`, event handlers
4. **URL validation**: Allows only `http://`, `https://`, or relative paths

## Backend Configuration

### WebSocketConfig

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config
      .enableStompBrokerRelay("/topic")
      .setRelayHost(brokerHost)
      .setRelayPort(brokerPort)
      .setClientLogin(brokerUser)
      .setClientPasscode(brokerPassword);
    config.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws").setAllowedOrigins(allowedOrigins);
  }
}
```

### JwtChannelInterceptor

Authenticates WebSocket connections:

```java
@Override
public Message<?> preSend(Message<?> message, MessageChannel channel) {
  if (command == StompCommand.CONNECT) {
    String authHeader = accessor.getFirstNativeHeader("Authorization");
    String jwt = authHeader.substring(7); // Remove "Bearer "

    if (jwtService.isTokenValid(jwt, userDetails)) {
      accessor.setUser(authToken);
    }
  }
  return message;
}
```

## Size Limits

| Layer             | Limit  | Purpose                    |
| ----------------- | ------ | -------------------------- |
| Frontend message  | 480 KB | Prevent oversized drawings |
| Backend transport | 1 MB   | STOMP frame limit          |
| Backend buffer    | 1 MB   | Per-connection send buffer |

## Heartbeat Configuration

Both client and server use 10-second heartbeat intervals:

- **Purpose**: Detect stale connections
- **Client**: Sends heartbeat every 10s
- **Server**: Expects heartbeat every 10s
- **Timeout**: Connection considered dead after missed heartbeats

## Performance Optimizations

1. **Lazy Loading**: `@stomp/stompjs` loaded only after authentication
2. **Connection Polling**: State checked every 3 seconds for UI sync
3. **Subscription Delay**: 100ms delay before subscribing to ensure stability
4. **Parallel Notifications**: Multi-board broadcasts use parallel streams
5. **Soft Deletes**: Objects marked inactive rather than deleted

## Error Handling

### Connection Errors

```typescript
stompClient.onStompError = (frame) => {
  logger.error('Broker error:', frame.headers['message']);
  this.disconnect();
};

stompClient.onWebSocketClose = () => {
  if (this.rollbackCallbacks.size > 0) {
    this.rollbackCallbacks.forEach((callback) => callback());
  }
};
```

### Message Errors

Backend sends errors to `/user/queue/errors`:

```java
catch (Exception e) {
    messagingTemplate.convertAndSendToUser(
        userEmail,
        "/topic/errors",
        new ErrorResponse(e.getMessage())
    );
}
```

## Timing Constants

| Constant               | Value | Purpose                    |
| ---------------------- | ----- | -------------------------- |
| Connection timeout     | 10s   | Max wait for STOMP CONNECT |
| Heartbeat interval     | 10s   | Keep-alive frequency       |
| Base reconnect delay   | 2s    | Initial retry delay        |
| Max reconnect delay    | 30s   | Capped retry delay         |
| Max reconnect attempts | 5     | Before giving up           |
| Subscription delay     | 100ms | Stability buffer           |
| State poll interval    | 3s    | UI sync frequency          |
