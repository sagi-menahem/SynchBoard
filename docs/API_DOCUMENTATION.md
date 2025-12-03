# SynchBoard API Documentation

## Base URL

| Environment        | Base URL                     |
| ------------------ | ---------------------------- |
| Production         | `https://synchboard.com/api` |
| Docker Development | `http://localhost/api`       |
| Local Development  | `http://localhost:8080/api`  |

All endpoints documented below are relative to the base URL (e.g., `/auth/login` becomes `https://synchboard.com/api/auth/login` in production).

---

## Authentication

The SynchBoard API uses JWT (JSON Web Token) based authentication. Include the JWT token in the Authorization header for protected endpoints:

```
Authorization: Bearer <your-jwt-token>
```

Most endpoints require authentication except for auth endpoints, user existence checks, and configuration endpoints.

---

## Configuration Endpoints

| Endpoint                   | Description                         | Request Body | Success Response           |
| -------------------------- | ----------------------------------- | ------------ | -------------------------- |
| `GET /api/config/features` | Get available feature configuration | None         | Feature availability flags |

### Feature Configuration Response

```json
{
  "emailVerificationEnabled": true,
  "passwordResetEnabled": true,
  "googleLoginEnabled": false
}
```

This endpoint allows the frontend to determine which optional features are available based on backend configuration (API keys, etc.).

---

## Authentication Endpoints

| Endpoint                             | Description                         | Request Body                    | Success Response |
| ------------------------------------ | ----------------------------------- | ------------------------------- | ---------------- |
| `POST /api/auth/register`            | Register a new user account         | User registration details       | Success message  |
| `POST /api/auth/login`               | Authenticate user and get JWT token | Login credentials               | JWT auth token   |
| `POST /api/auth/google-one-tap`      | Authenticate via Google One Tap     | Google credential (ID Token)    | JWT auth token   |
| `POST /api/auth/verify-email`        | Verify email with verification code | Email and 6-digit code          | JWT auth token   |
| `POST /api/auth/resend-verification` | Resend email verification code      | Email address                   | Success message  |
| `POST /api/auth/forgot-password`     | Initiate password reset process     | Email address                   | Success message  |
| `POST /api/auth/reset-password`      | Reset password with reset code      | Email, reset code, new password | JWT auth token   |

### Authentication Examples

**Register a new user:**

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "male"
  }'
```

Response (when email verification is enabled):

```json
{
  "message": "Verification code sent to your email"
}
```

**Login:**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

Response:

```json
{
  "token": "***REDACTED_JWT_HEADER***..."
}
```

**Verify email:**

```bash
curl -X POST http://localhost:8080/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "123456"
  }'
```

Response:

```json
{
  "token": "***REDACTED_JWT_HEADER***..."
}
```

---

## Board Management Endpoints

| Endpoint                                                  | Description                       | Request Body               | Success Response                 |
| --------------------------------------------------------- | --------------------------------- | -------------------------- | -------------------------------- |
| `GET /api/boards`                                         | Get all boards for current user   | N/A                        | Array of user's boards           |
| `POST /api/boards`                                        | Create a new board                | Board details and settings | Created board object             |
| `GET /api/boards/{boardId}/details`                       | Get detailed board information    | N/A                        | Board details with members       |
| `GET /api/boards/{boardId}/objects`                       | Get all drawing objects for board | N/A                        | Array of drawing objects         |
| `POST /api/boards/{boardId}/members`                      | Invite member to board            | Email address              | New member details               |
| `DELETE /api/boards/{boardId}/members/{memberEmail}`      | Remove member from board          | N/A                        | No content                       |
| `DELETE /api/boards/{boardId}/members/leave`              | Leave a board                     | N/A                        | No content                       |
| `PUT /api/boards/{boardId}/members/{memberEmail}/promote` | Promote member to admin           | N/A                        | Updated member details           |
| `POST /api/boards/{boardId}/undo`                         | Undo last drawing action          | N/A                        | Undo action result or no content |
| `POST /api/boards/{boardId}/redo`                         | Redo last undone action           | N/A                        | Redo action result or no content |
| `PUT /api/boards/{boardId}/name`                          | Update board name                 | New board name             | Updated board object             |
| `PUT /api/boards/{boardId}/description`                   | Update board description          | New description            | Updated board object             |
| `POST /api/boards/{boardId}/picture`                      | Upload board picture              | Image file                 | Updated board object             |
| `DELETE /api/boards/{boardId}/picture`                    | Delete board picture              | N/A                        | Updated board object             |
| `GET /api/boards/{boardId}/messages`                      | Get chat messages for board       | N/A                        | Array of chat messages           |
| `PUT /api/boards/{boardId}/canvas-settings`               | Update canvas settings            | Canvas configuration       | Updated board object             |

### Board Management Examples

**Create a new board:**

```bash
curl -X POST http://localhost:8080/api/boards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Project Brainstorm",
    "description": "Team collaboration board",
    "canvasWidth": 3000,
    "canvasHeight": 2000,
    "canvasBackgroundColor": "#FFFFFF"
  }'
```

Response:

```json
{
  "id": 1,
  "name": "Project Brainstorm",
  "description": "Team collaboration board",
  "isAdmin": true,
  "createdByEmail": "user@example.com",
  "canvasWidth": 3000,
  "canvasHeight": 2000,
  "canvasBackgroundColor": "#FFFFFF",
  "creationDate": "2025-01-15T10:30:00",
  "lastModifiedDate": "2025-01-15T10:30:00"
}
```

**Get all user boards:**

```bash
curl -X GET http://localhost:8080/api/boards \
  -H "Authorization: Bearer <your-jwt-token>"
```

Response:

```json
[
  {
    "id": 1,
    "name": "Project Brainstorm",
    "description": "Team collaboration board",
    "isAdmin": true,
    "groupPictureUrl": null,
    "creationDate": "2025-01-15T10:30:00"
  },
  {
    "id": 2,
    "name": "Design Review",
    "description": null,
    "isAdmin": false,
    "groupPictureUrl": "/images/board-2.png",
    "creationDate": "2025-01-14T09:00:00"
  }
]
```

**Invite a member:**

```bash
curl -X POST http://localhost:8080/api/boards/1/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "email": "colleague@example.com"
  }'
```

Response:

```json
{
  "email": "colleague@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "isAdmin": false,
  "joinDate": "2025-01-15T11:00:00",
  "profilePictureUrl": null
}
```

**Update canvas settings:**

```bash
curl -X PUT http://localhost:8080/api/boards/1/canvas-settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "canvasWidth": 4000,
    "canvasHeight": 3000,
    "canvasBackgroundColor": "#F5F5F5"
  }'
```

---

## User Management Endpoints

| Endpoint                             | Description                     | Request Body             | Success Response           |
| ------------------------------------ | ------------------------------- | ------------------------ | -------------------------- |
| `GET /api/user/exists/{email}`       | Check if user exists            | N/A                      | Boolean value              |
| `GET /api/user/profile`              | Get current user profile        | N/A                      | User profile object        |
| `PUT /api/user/profile`              | Update user profile             | Profile details          | Updated profile object     |
| `PUT /api/user/password`             | Change user password            | Current and new password | No content                 |
| `POST /api/user/profile-picture`     | Upload profile picture          | Image file               | Updated profile object     |
| `DELETE /api/user/profile-picture`   | Delete profile picture          | N/A                      | Updated profile object     |
| `DELETE /api/user/account`           | Delete user account             | N/A                      | No content                 |
| `PUT /api/user/preferences`          | Update general preferences      | Preference settings      | Updated profile object     |
| `GET /api/user/canvas-preferences`   | Get canvas preferences          | N/A                      | Canvas preference object   |
| `PUT /api/user/canvas-preferences`   | Update canvas preferences       | Canvas settings          | Updated preferences        |
| `GET /api/user/tool-preferences`     | Get drawing tool preferences    | N/A                      | Tool preference object     |
| `PUT /api/user/tool-preferences`     | Update drawing tool preferences | Tool settings            | Updated preferences        |
| `GET /api/user/language-preferences` | Get language preferences        | N/A                      | Language preference object |
| `PUT /api/user/language-preferences` | Update language preferences     | Language setting         | Updated preferences        |
| `GET /api/user/theme-preferences`    | Get theme preferences           | N/A                      | Theme preference object    |
| `PUT /api/user/theme-preferences`    | Update theme preferences        | Theme setting            | Updated preferences        |

### User Management Examples

**Get user profile:**

```bash
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

Response:

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "male",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "profilePictureUrl": "/images/profile-user.png",
  "creationDate": "2025-01-10T08:00:00",
  "authProvider": "LOCAL"
}
```

**Update user profile:**

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+1987654321"
  }'
```

**Change password:**

```bash
curl -X PUT http://localhost:8080/api/user/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

Response: `204 No Content`

**Update tool preferences:**

```bash
curl -X PUT http://localhost:8080/api/user/tool-preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "defaultTool": "brush",
    "defaultStrokeColor": "#FF5733",
    "defaultStrokeWidth": 5
  }'
```

---

## WebSocket Communication

The API supports real-time communication through WebSocket endpoints using STOMP protocol.

**Connection Endpoints:**

| Environment        | WebSocket URL             |
| ------------------ | ------------------------- |
| Production         | `wss://synchboard.com/ws` |
| Docker Development | `ws://localhost/ws`       |
| Local Development  | `ws://localhost:8080/ws`  |

All WebSocket connections require JWT authentication via STOMP headers.

### Real-time Endpoints

| Destination             | Description          | Message Format      |
| ----------------------- | -------------------- | ------------------- |
| `/app/board.drawAction` | Send drawing actions | Drawing action data |
| `/app/chat.sendMessage` | Send chat messages   | Chat message data   |

### Subscription Topics

| Topic                    | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `/topic/board/{boardId}` | Board-specific updates (drawing, chat, settings) |
| `/topic/user/{userEmail}` | Personal notifications (board invites, updates) |
| `/user/queue/errors`     | User-specific error messages                     |

> **Note:** The backend sends errors via `messagingTemplate.convertAndSendToUser(email, "/topic/errors", ...)`. Spring STOMP automatically translates this to `/user/queue/errors` for user-specific delivery.

---

## Common Response Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no response body
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Request conflicts with current state

---

## Key Validation Rules

- **Email addresses**: Must be valid format
- **Verification codes**: Exactly 6 digits
- **Board names**: 3-100 characters
- **Canvas dimensions**: Width 400-4000px, Height 300-4000px
- **Gender**: "male" or "female"
- **Theme**: "light" or "dark"
- **Language**: "en" or "he"
- **Hex colors**: Valid hex format (e.g., #FF0000)
- **File uploads**: Max 10MB, common image formats

---

## Error Responses

All error responses follow a consistent format:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: email must be a valid email address",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

### Common Error Examples

**401 Unauthorized (Invalid/expired token):**

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token has expired",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

**404 Not Found (Resource doesn't exist):**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Board not found with id: 999",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

**409 Conflict (Duplicate resource):**

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "User already exists with this email",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```
