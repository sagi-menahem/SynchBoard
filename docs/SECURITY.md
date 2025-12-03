# Security Architecture

This document describes the security mechanisms implemented in SynchBoard, including authentication, authorization, input validation, and secure file handling.

## Authentication

### JWT Token System

**Configuration:**

- Algorithm: HMAC SHA (jjwt library)
- Expiration: 24 hours (configurable via `JWT_EXPIRATION_HOURS`)
- Secret: Base64-encoded key from `JWT_SECRET_KEY` environment variable

**Token Structure:**

```json
{
  "sub": "user@example.com",
  "iat": 1704067200,
  "exp": 1704153600
}
```

**Token Flow:**

1. User authenticates (login, OAuth2, or registration)
2. Backend generates JWT with user email as subject
3. Frontend stores token in localStorage
4. Token attached to all protected requests via `Authorization: Bearer {token}` header

**Token Validation:**

- Backend: `JwtService.isTokenValid()` verifies signature and expiration
- Frontend: `isTokenValid()` checks expiration for proactive refresh
- Refresh threshold: Token refreshed if expiring within 5 minutes

### HTTP Request Authentication

`JwtAuthFilter` (extends `OncePerRequestFilter`):

1. Extracts `Authorization` header
2. Validates `Bearer ` prefix (7 characters)
3. Parses and validates JWT
4. Loads `UserDetails` from database
5. Sets `SecurityContextHolder` authentication

### WebSocket Authentication

`JwtChannelInterceptor` intercepts STOMP CONNECT frames:

1. Extracts JWT from `Authorization` native header
2. Validates token against user database
3. Sets authentication on STOMP accessor
4. Connection rejected if authentication fails

## Authorization

### Endpoint Security

**Public Endpoints (no authentication required):**

- `/api/auth/**` - Registration, login, verification
- `/api/config/**` - Feature flags
- `/ws/**` - WebSocket endpoint (auth via STOMP)
- `/login/oauth2/**`, `/oauth2/**` - OAuth2 flows
- `GET /images/**` - Image serving

**Protected Endpoints:**

- `/api/users/**` - User profile operations
- `/api/boards/**` - Board CRUD and management
- All other endpoints - Authenticated users only

### Board Access Control

`BoardAccessService` provides role-based access:

| Method                  | Checks                  | Use Case                         |
| ----------------------- | ----------------------- | -------------------------------- |
| `validateBoardAccess`   | Member OR creator       | View board, send messages        |
| `validateAdminAccess`   | Admin member OR creator | Manage members, settings         |
| `validateCreatorAccess` | Creator only            | Delete board, transfer ownership |

**Roles:**

- **Creator**: User who created the board (stored in `GroupBoard.createdByUser`)
- **Admin**: Member with `GroupMember.isAdmin = true`
- **Member**: User in `GroupMember` table for the board

**Access Denial:**

- Throws `AccessDeniedException` (403) when access denied
- Throws `ResourceNotFoundException` (404) when resource missing

## Password Security

### Hashing

- **Algorithm**: BCrypt with 10-round strength
- **Encoder**: Spring Security `BCryptPasswordEncoder`
- **Storage**: Only hashed passwords stored in database

### Password Reset Flow

1. User requests reset via email
2. System generates 6-digit code with 60-minute expiration
3. Code stored in `User.resetCode`, expiry in `User.resetExpiry`
4. User submits code + new password
5. System validates code and expiration
6. Password updated, code cleared, JWT returned

### Email Verification

1. Registration creates `PendingRegistration` with 6-digit code
2. Code expires after 15 minutes
3. Maximum 3 verification attempts tracked
4. Successful verification creates `User` and clears pending

## Input Validation

### Frontend Sanitization

`SecurityUtils.ts` provides XSS prevention:

**Blocked Patterns:**

- Script tags: `<script>...</script>`
- iFrame tags: `<iframe>...</iframe>`
- JavaScript protocol: `javascript:`
- Event handlers: `onclick=`, `onload=`, etc.
- Data URLs: `data:text/html`

**Functions:**

```typescript
sanitizeString(input); // Remove XSS patterns from string
sanitizeObject(obj); // Recursively sanitize object properties
isSafeUrl(url); // Validate URL protocol
validateMessage(data); // Validate WebSocket message structure
```

### Prototype Pollution Prevention

All incoming objects checked for:

- `__proto__` key
- `prototype` key
- `constructor.prototype` modifications

### Backend Validation

- **Request DTOs**: Jakarta Validation annotations (`@NotNull`, `@Size`, etc.)
- **Global Handler**: `GlobalExceptionHandler` converts `MethodArgumentNotValidException` to 400 response
- **Repository Layer**: Spring Data JPA parameterized queries prevent SQL injection

## File Upload Security

### Validation Pipeline

```
Upload → Extension Check → MIME Type Check → File Signature Check →
SVG Scanning (if SVG) → Size Check → Secure Path Resolution → Storage
```

### Extension Validation

**Allowed Extensions:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`

### MIME Type Validation

**Allowed Types:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`

### File Signature Verification

Binary header verification for each format:

| Format | Signature                                  |
| ------ | ------------------------------------------ |
| JPEG   | `0xFF 0xD8`                                |
| PNG    | `0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A`  |
| GIF    | `0x47 0x49 0x46 0x38`                      |
| WebP   | `0x52 0x49 0x46 0x46` + `WEBP` at offset 8 |

### SVG Security Scanning

SVG files scanned for dangerous patterns (case-insensitive):

**Script Execution:**

- `<script`, `javascript:`, `vbscript:`, `livescript:`
- `eval(`, `import(`

**Event Handlers:**

- `onclick`, `onload`, `onerror`, `onmouseover`, `onfocus`, `onblur`, `oninput`, `onchange`, `onsubmit`

**Embedded Content:**

- `<iframe`, `<embed`, `<object`, `<foreignobject`, `<applet`

**Data URLs:**

- `data:text/html`, `data:text/javascript`

**DOM Manipulation:**

- `document.cookie`, `document.write`, `window.location`
- `.innerHTML`, `.outerHTML`, `expression(`

### Path Security

- **Path Traversal Prevention**: Blocks `..` sequences
- **Path Normalization**: Resolves symlinks
- **Root Validation**: All paths must start with configured root directory
- **UUID Filenames**: Random names prevent enumeration

### Size Limits

- **Maximum File Size**: 5 MB (5,242,880 bytes)
- **Checked Before Storage**: Prevents resource exhaustion

## OAuth2 Security

### Google OAuth2 Flow

1. Frontend redirects to `/oauth2/authorization/google`
2. User authenticates with Google
3. Google returns authorization code to backend
4. Backend exchanges code for tokens
5. Backend verifies ID token with Google API
6. User created/updated, JWT generated
7. Redirect to frontend with JWT in URL

### Google One Tap

1. Frontend receives credential from Google SDK
2. POST credential to `/api/auth/google-one-tap`
3. Backend verifies with `GoogleIdTokenVerifier`
4. User created/updated, JWT returned

### Account Linking

When Google user has existing local account:

- Accounts merged if emails match
- Password preserved (LOCAL auth provider kept)
- Google profile data updates local profile

## CORS Configuration

```java
AllowedOrigins: [from CLIENT_ORIGIN_URL env]
AllowedMethods: [GET, POST, PUT, DELETE, OPTIONS]
AllowedHeaders: [*]
AllowCredentials: true
```

## WebSocket Security

### Message Validation

Frontend validates all incoming WebSocket messages:

- Size limit: 480 KB (configurable)
- Required field validation per message type
- Type allowlisting for update messages
- Content length limits for chat

### Message Size Limits

| Layer             | Limit  |
| ----------------- | ------ |
| Frontend          | 480 KB |
| Backend transport | 1 MB   |
| Backend buffer    | 1 MB   |

## Session Management

### Stateless Design

- No server-side session storage
- JWT contains all authentication state
- Session creation policy: `STATELESS`
- CSRF protection disabled (not needed for stateless JWT)

### Token Refresh

- Frontend checks token expiration before requests
- Proactive refresh when < 5 minutes remaining
- 401/403 responses trigger automatic logout

## Error Handling

### Exception Mapping

| Exception                         | HTTP Status               |
| --------------------------------- | ------------------------- |
| `BadCredentialsException`         | 401 Unauthorized          |
| `AccessDeniedException`           | 403 Forbidden             |
| `ResourceNotFoundException`       | 404 Not Found             |
| `InvalidRequestException`         | 400 Bad Request           |
| `ResourceConflictException`       | 409 Conflict              |
| `MethodArgumentNotValidException` | 400 Bad Request           |
| All others                        | 500 Internal Server Error |

### Security Logging

All security events logged with `[SECURITY]` prefix:

- Successful authentications
- Failed login attempts
- Access denials
- Token validation failures
- File upload rejections

## Configuration

### Required Environment Variables

| Variable               | Purpose                         |
| ---------------------- | ------------------------------- |
| `JWT_SECRET_KEY`       | Base64-encoded JWT signing key  |
| `CLIENT_ORIGIN_URL`    | CORS allowed origin             |
| `GOOGLE_CLIENT_ID`     | OAuth2 client ID (optional)     |
| `GOOGLE_CLIENT_SECRET` | OAuth2 client secret (optional) |

### Security Constants

| Constant                   | Value      |
| -------------------------- | ---------- |
| JWT expiration             | 24 hours   |
| Email verification timeout | 15 minutes |
| Password reset timeout     | 60 minutes |
| Max verification attempts  | 3          |
| BCrypt rounds              | 10         |
| Max file size              | 5 MB       |
| WebSocket message limit    | 1 MB       |

## Security Headers

Production Nginx configuration includes:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Content Security Policy (CSP) for script sources
- HSTS (when SSL enabled)

See `NGINX_CONFIGURATION.md` for complete header configuration.
