# Authentication

This document describes the authentication system in SynchBoard, including JWT-based authentication, OAuth2 Google integration, email verification, and password reset flows.

## Overview

SynchBoard uses:

- **JWT tokens** for stateless authentication
- **BCrypt** for password hashing
- **OAuth2** for Google login
- **Gmail REST API** for email verification and password reset
- **STOMP** header authentication for WebSocket connections

## JWT Configuration

| Setting      | Value     |
| ------------ | --------- |
| Algorithm    | HMAC SHA  |
| Expiration   | 24 hours  |
| Token Prefix | `Bearer ` |

Token structure:

- `sub`: User email (primary identifier)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

## Authentication Flows

### Local Login

```
Frontend                        Backend
   |                               |
   |-- POST /api/auth/login ------>|
   |   (email, password)           |
   |                               | Validate credentials
   |                               | Generate JWT
   |<---- AuthResponseDTO ---------|
   |   (token)                     |
   | Store token in localStorage   |
```

### Registration with Email Verification

```
Frontend                        Backend                    Gmail API
   |                               |                           |
   |-- POST /api/auth/register --->|                           |
   |   (email, password, name)     |                           |
   |                               | Create PendingRegistration|
   |                               |--- Send verification ---->|
   |<---- "Check email" -----------|                           |
   |                               |                           |
   | User enters 6-digit code      |                           |
   |-- POST /api/auth/verify ----->|                           |
   |   (email, code)               | Validate code             |
   |                               | Create User entity        |
   |<---- AuthResponseDTO ---------|                           |
```

**Verification Code**:

- Format: 6-digit numeric (`000000` - `999999`)
- Expiry: 15 minutes
- Max attempts: 3 (then must resend)

### Password Reset

```
Frontend                        Backend                    Gmail API
   |                               |                          |
   |-- POST /api/auth/forgot ----->|                          |
   |   (email)                     |                          |
   |                               |--- Send reset code ----->|
   |<---- "Check email" -----------|                          |
   |                               |                          |
   | User enters code + new pass   |                          |
   |-- POST /api/auth/reset ------>|                          |
   |   (email, code, newPassword)  | Validate & update        |
   |<---- AuthResponseDTO ---------|                          |
```

**Reset Code**:

- Format: 6-digit numeric
- Expiry: 60 minutes

### OAuth2 Google Login (Redirect Flow)

```
Frontend         Backend                     Google
   |                |                           |
   | Click "Google" |                           |
   |------------->|                             |
   |   Redirect to /oauth2/authorization/google |
   |                |                           |
   |<-----------------------------------| Google consent
   |                |                   |
   | Grant permission                   |
   |----------------------------------->| Callback
   |                |<------------------| Token exchange
   |                | Process user      |
   |<--- Redirect /auth/callback?token=-|
   | Extract token  |                   |
```

### Google One Tap (Passwordless)

```
Frontend                             Backend
   |                                    |
   | Google SDK returns credential      |
   |-- POST /api/auth/google-one-tap -->|
   |   (credential: ID Token)           |
   |                                    | Verify with GoogleIdTokenVerifier
   |                                    | Process user
   |<---- AuthResponseDTO --------------|
```

## OAuth2 User Processing

When a Google user authenticates:

1. **New User**: Create account with `authProvider = GOOGLE`
2. **Existing Google User**: Update profile (name, picture, providerId)
3. **Existing Local User**: Merge accounts:
   - Preserve password (allows dual login)
   - Keep `authProvider = LOCAL`
   - Set `providerId` for linking
   - Clear email verification token (Google verified)

## WebSocket Authentication

WebSocket connections authenticate via JWT in STOMP headers:

```
CONNECT
Authorization: Bearer <token>

^@
```

The `JwtChannelInterceptor` validates the token on CONNECT:

1. Extract token from Authorization header
2. Validate using `JwtService.isTokenValid()`
3. Set authentication on message accessor
4. Allow/reject connection

## Endpoint Security

### Public Endpoints

| Path               | Purpose                          |
| ------------------ | -------------------------------- |
| `/api/auth/**`     | All auth routes                  |
| `/ws/**`           | WebSocket (JWT in STOMP headers) |
| `/api/images/**`   | Image serving (GET only)         |
| `/login/oauth2/**` | OAuth2 authorization             |
| `/oauth2/**`       | OAuth2 callbacks                 |
| `/api/config/**`   | Feature flags                    |

### Protected Endpoints

All other endpoints require valid JWT in `Authorization: Bearer <token>` header.

## Frontend Token Management

### Storage

- **Location**: `localStorage` with key `token`
- **Format**: Raw JWT string

### Token Utilities

```typescript
// shared/utils/authUtils.ts
getToken(): string | null           // Retrieve token
setToken(token): void               // Store token
removeToken(): void                 // Delete token
isTokenValid(token): boolean        // Check not expired
getUserEmailFromToken(token): string // Extract sub claim
shouldRefreshToken(token): boolean   // True if expires in < 5 min
```

### Session Expiry Warning

The frontend displays a warning toast 5 minutes before token expiry, allowing users to save work or extend their session.

## Protected Routes

`ProtectedRoute` component:

1. Checks React context token
2. Validates via `isTokenValid()`
3. Redirects to `/auth` if invalid

## API Client

Axios instance automatically:

- Attaches JWT to all requests
- Clears token on 401 responses

## REST API

### Endpoints

| Method | Path                            | Request                   | Response                   |
| ------ | ------------------------------- | ------------------------- | -------------------------- |
| POST   | `/api/auth/register`            | RegisterRequest           | AuthResponseDTO or message |
| POST   | `/api/auth/login`               | LoginRequest              | AuthResponseDTO            |
| POST   | `/api/auth/verify-email`        | VerifyEmailRequest        | AuthResponseDTO            |
| POST   | `/api/auth/resend-verification` | ResendVerificationRequest | message                    |
| POST   | `/api/auth/forgot-password`     | ForgotPasswordRequest     | message                    |
| POST   | `/api/auth/reset-password`      | ResetPasswordRequest      | AuthResponseDTO            |
| POST   | `/api/auth/google-one-tap`      | GoogleOneTapRequest       | AuthResponseDTO            |

### Request/Response DTOs

```java
// LoginRequest
{
  "email": "user@example.com",
  "password": "password123"
}

// RegisterRequest
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

// AuthResponseDTO
{
  "token": "<jwt-token-here>"
}

// VerifyEmailRequest
{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

## Password Security

- **Algorithm**: BCrypt
- **Strength**: 10 rounds (default)
- **Storage**: Nullable (null for Google-only accounts)

## Email Configuration

### Environment Variables

| Variable              | Required  | Default    | Description                            |
| --------------------- | --------- | ---------- | -------------------------------------- |
| `GMAIL_CLIENT_ID`     | For email | -          | OAuth2 Client ID from Google Cloud     |
| `GMAIL_CLIENT_SECRET` | For email | -          | OAuth2 Client Secret from Google Cloud |
| `GMAIL_REFRESH_TOKEN` | For email | -          | OAuth2 Refresh Token (long-lived)      |
| `GMAIL_SENDER_EMAIL`  | For email | -          | Gmail address used to send emails      |
| `MAIL_FROM_NAME`      | No        | SynchBoard | Sender display name                    |

See [docs/EMAIL_SERVICE.md](EMAIL_SERVICE.md) for detailed setup instructions.

### Templates

Located in `backend/src/main/resources/templates/email/`:

- `verification.html` - English verification email
- `verification_he.html` - Hebrew verification email
- Password reset templates follow same pattern

### Localization

Email templates use user's preferred language stored in profile.

## OAuth2 Configuration

### Environment Variables

| Variable               | Required  | Default                                        |
| ---------------------- | --------- | ---------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | For OAuth | -                                              |
| `GOOGLE_CLIENT_SECRET` | For OAuth | -                                              |
| `GOOGLE_REDIRECT_URI`  | No        | http://localhost:8080/login/oauth2/code/google |

### Google API Settings

- **Scopes**: `email`, `profile`
- **Authorization URI**: https://accounts.google.com/o/oauth2/v2/auth
- **Token URI**: https://oauth2.googleapis.com/token
- **User Info URI**: https://www.googleapis.com/oauth2/v3/userinfo

## Feature Flags

Authentication features auto-enable based on configuration:

| Feature            | Required Config                                                                     |
| ------------------ | ----------------------------------------------------------------------------------- |
| Email verification | `GMAIL_CLIENT_ID` + `GMAIL_CLIENT_SECRET` + `GMAIL_REFRESH_TOKEN` + `GMAIL_SENDER_EMAIL` |
| Password reset     | `GMAIL_CLIENT_ID` + `GMAIL_CLIENT_SECRET` + `GMAIL_REFRESH_TOKEN` + `GMAIL_SENDER_EMAIL` |
| Google login       | `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`                                         |

Frontend checks `/api/config/features` endpoint for enabled features.

## Security Considerations

### Token Security

- HMAC SHA signature prevents tampering
- 24-hour expiry limits stolen token damage
- Stateless: no server-side session state
- 5-minute client-side expiry warning

### Brute Force Protection

- Verification codes: 3 max attempts
- Email throttling via Gmail API rate limits

### Account Linking

- Google accounts link to existing local accounts by email
- Merged accounts can use either auth method
- Prevents duplicate accounts

### Production Requirements

1. **HTTPS**: Tokens transmitted in headers require TLS
2. **JWT Secret**: Minimum 32 characters for HMAC SHA
3. **CORS**: Configure `ALLOWED_ORIGINS` for production domain

## Key Files

### Backend

| File                                          | Purpose                     |
| --------------------------------------------- | --------------------------- |
| `config/security/SecurityConfig.java`         | Security rules              |
| `config/security/JwtAuthFilter.java`          | HTTP JWT filter             |
| `config/websocket/JwtChannelInterceptor.java` | WebSocket auth              |
| `service/auth/JwtService.java`                | Token generation/validation |
| `service/auth/AuthService.java`               | Auth business logic         |
| `service/auth/GoogleAuthService.java`         | OAuth processing            |
| `service/auth/EmailService.java`              | Email sending               |
| `controller/AuthController.java`              | REST endpoints              |

### Frontend

| File                                    | Purpose          |
| --------------------------------------- | ---------------- |
| `features/auth/AuthProvider.tsx`        | Auth context     |
| `features/auth/services/authService.ts` | API calls        |
| `shared/utils/authUtils.ts`             | Token utilities  |
| `shared/ui/routing/ProtectedRoute.tsx`  | Route protection |
| `features/auth/components/`             | Auth forms       |

## User Entity

```java
public class User implements UserDetails {

  @Id
  private String email; // Primary identifier

  private String password; // Nullable (Google-only)
  private String firstName;
  private String lastName;

  @Enumerated(EnumType.STRING)
  private AuthProvider authProvider; // LOCAL or GOOGLE

  private String providerId; // Google sub claim

  private String resetCode; // Password reset
  private LocalDateTime resetExpiry;

  private String emailVerificationToken;

  // UserDetails methods...
}
```

## Dependencies

### Backend

```groovy
// JWT
implementation 'io.jsonwebtoken:jjwt-api:0.13.0'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.13.0'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.13.0'

// OAuth2
implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
implementation 'com.google.api-client:google-api-client:2.7.2'

// Email
implementation 'org.springframework.boot:spring-boot-starter-mail'
implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
```

### Frontend

```json
{
  "jwt-decode": "^4.0.0" // Token decoding
}
```
