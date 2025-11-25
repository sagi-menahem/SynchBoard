# SynchBoard API Documentation

## Base URL

| Environment | Base URL |
| --- | --- |
| Production | `https://synchboard.com/api` |
| Docker Development | `http://localhost/api` |
| Local Development | `http://localhost:8080/api` |

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

| Endpoint | Description | Request Body | Success Response |
| --- | --- | --- | --- |
| `GET /api/config/features` | Get available feature configuration | None | Feature availability flags |

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

| Endpoint | Description | Request Body | Success Response |
| --- | --- | --- | --- |
| `POST /api/auth/register` | Register a new user account | User registration details | Success message |
| `POST /api/auth/login` | Authenticate user and get JWT token | Login credentials | JWT auth token |
| `POST /api/auth/verify-email` | Verify email with verification code | Email and 6-digit code | JWT auth token |
| `POST /api/auth/resend-verification` | Resend email verification code | Email address | Success message |
| `POST /api/auth/forgot-password` | Initiate password reset process | Email address | Success message |
| `POST /api/auth/reset-password` | Reset password with reset code | Email, reset code, new password | Success message |

---

## Board Management Endpoints

| Endpoint | Description | Request Body | Success Response |
| --- | --- | --- | --- |
| `GET /api/boards` | Get all boards for current user | N/A | Array of user's boards |
| `POST /api/boards` | Create a new board | Board details and settings | Created board object |
| `GET /api/boards/{boardId}/details` | Get detailed board information | N/A | Board details with members |
| `GET /api/boards/{boardId}/objects` | Get all drawing objects for board | N/A | Array of drawing objects |
| `POST /api/boards/{boardId}/members` | Invite member to board | Email address | New member details |
| `DELETE /api/boards/{boardId}/members/{memberEmail}` | Remove member from board | N/A | No content |
| `DELETE /api/boards/{boardId}/members/leave` | Leave a board | N/A | No content |
| `PUT /api/boards/{boardId}/members/{memberEmail}/promote` | Promote member to admin | N/A | Updated member details |
| `POST /api/boards/{boardId}/undo` | Undo last drawing action | N/A | Undo action result or no content |
| `POST /api/boards/{boardId}/redo` | Redo last undone action | N/A | Redo action result or no content |
| `PUT /api/boards/{boardId}/name` | Update board name | New board name | Updated board object |
| `PUT /api/boards/{boardId}/description` | Update board description | New description | Updated board object |
| `POST /api/boards/{boardId}/picture` | Upload board picture | Image file | Updated board object |
| `DELETE /api/boards/{boardId}/picture` | Delete board picture | N/A | Updated board object |
| `GET /api/boards/{boardId}/messages` | Get chat messages for board | N/A | Array of chat messages |
| `PUT /api/boards/{boardId}/canvas-settings` | Update canvas settings | Canvas configuration | Updated board object |

---

## User Management Endpoints

| Endpoint | Description | Request Body | Success Response |
| --- | --- | --- | --- |
| `GET /api/user/exists/{email}` | Check if user exists | N/A | Boolean value |
| `GET /api/user/profile` | Get current user profile | N/A | User profile object |
| `PUT /api/user/profile` | Update user profile | Profile details | Updated profile object |
| `PUT /api/user/password` | Change user password | Current and new password | No content |
| `POST /api/user/profile-picture` | Upload profile picture | Image file | Updated profile object |
| `DELETE /api/user/profile-picture` | Delete profile picture | N/A | Updated profile object |
| `DELETE /api/user/account` | Delete user account | N/A | No content |
| `PUT /api/user/preferences` | Update general preferences | Preference settings | Updated profile object |
| `GET /api/user/canvas-preferences` | Get canvas preferences | N/A | Canvas preference object |
| `PUT /api/user/canvas-preferences` | Update canvas preferences | Canvas settings | Updated preferences |
| `GET /api/user/tool-preferences` | Get drawing tool preferences | N/A | Tool preference object |
| `PUT /api/user/tool-preferences` | Update drawing tool preferences | Tool settings | Updated preferences |
| `GET /api/user/language-preferences` | Get language preferences | N/A | Language preference object |
| `PUT /api/user/language-preferences` | Update language preferences | Language setting | Updated preferences |
| `GET /api/user/theme-preferences` | Get theme preferences | N/A | Theme preference object |
| `PUT /api/user/theme-preferences` | Update theme preferences | Theme setting | Updated preferences |

---

## WebSocket Communication

The API supports real-time communication through WebSocket endpoints using STOMP protocol.

**Connection Endpoints:**

| Environment | WebSocket URL |
| --- | --- |
| Production | `wss://synchboard.com/ws` |
| Docker Development | `ws://localhost/ws` |
| Local Development | `ws://localhost:8080/ws` |

All WebSocket connections require JWT authentication via STOMP headers.

### Real-time Endpoints

| Destination | Description | Message Format |
| --- | --- | --- |
| `/app/board.drawAction` | Send drawing actions | Drawing action data |
| `/app/chat.sendMessage` | Send chat messages | Chat message data |

### Subscription Topics

| Topic | Description |
| --- | --- |
| `/topic/board/{boardId}` | Board-specific updates (drawing, chat, settings) |
| `/user/queue/errors` | User-specific error messages |

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