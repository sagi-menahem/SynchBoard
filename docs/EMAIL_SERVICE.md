# Email Service

This document describes the email service in SynchBoard, including configuration, templates, and internationalization.

## Overview

SynchBoard uses the **Gmail REST API** with OAuth2 authentication for transactional emails:

- Email verification during registration
- Password reset codes

Email functionality is **optional** - if not configured, registration proceeds without verification.

### Why Gmail REST API?

The Gmail REST API is used instead of SMTP because:

1. **Cloud Provider Compatibility**: Most cloud providers (DigitalOcean, AWS, GCP, etc.) block SMTP ports (25, 465, 587) by default
2. **Reliability**: OAuth2 tokens are more secure and reliable than app passwords
3. **No Port Restrictions**: Gmail API uses HTTPS (port 443), which is never blocked

## Configuration

### Environment Variables

| Variable                        | Required  | Default        | Description                              |
| ------------------------------- | --------- | -------------- | ---------------------------------------- |
| `GMAIL_CLIENT_ID`               | For email | -              | OAuth2 Client ID from Google Cloud       |
| `GMAIL_CLIENT_SECRET`           | For email | -              | OAuth2 Client Secret from Google Cloud   |
| `GMAIL_REFRESH_TOKEN`           | For email | -              | OAuth2 Refresh Token (long-lived)        |
| `GMAIL_SENDER_EMAIL`            | For email | -              | Gmail address used to send emails        |
| `MAIL_FROM_NAME`                | No        | SynchBoard     | Sender display name                      |
| `VERIFICATION_EXPIRY_MINUTES`   | No        | 15             | Verification code lifetime               |
| `PASSWORD_RESET_EXPIRY_MINUTES` | No        | 60             | Reset code lifetime                      |

### Gmail API Setup

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Navigate to **APIs & Services** > **Library**
   - Search for "Gmail API"
   - Click **Enable**

#### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (or Internal for Google Workspace)
3. Fill in the required fields:
   - App name: `SynchBoard`
   - User support email: your email
   - Developer contact email: your email
4. Add the scope: `https://www.googleapis.com/auth/gmail.send`
5. Add your Gmail address as a test user (required for External apps)

#### Step 3: Create OAuth2 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Name: `SynchBoard Email Service`
5. Add Authorized redirect URI: `https://developers.google.com/oauthplayground`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

#### Step 4: Generate Refresh Token

Use the OAuth 2.0 Playground to generate a refresh token:

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon (Settings) in the top right
3. Check **Use your own OAuth credentials**
4. Enter your **Client ID** and **Client Secret**
5. Close settings
6. In Step 1, find **Gmail API v1** and select:
   - `https://www.googleapis.com/auth/gmail.send`
7. Click **Authorize APIs**
8. Sign in with the Gmail account you want to send from
9. Click **Exchange authorization code for tokens**
10. Copy the **Refresh Token**

#### Step 5: Update Environment Variables

Add the credentials to your `.env` file:

```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_SENDER_EMAIL=your-email@gmail.com
```

### Feature Detection

```java
public boolean isEmailEnabled() {
    return gmail != null && isNotEmpty(senderEmail);
}
```

When disabled:

- Registration creates users immediately without verification
- Password reset is unavailable
- Warning logged for skipped emails

## Email Types

### Verification Email

**Trigger**: User registration when email enabled

**Code Format**: 6-digit numeric (`000000` - `999999`)

**Template Variables**:

- `verificationCode`: The 6-digit code
- `expiryMinutes`: Minutes until code expires (default 15)

### Password Reset Email

**Trigger**: User requests password reset

**Code Format**: 6-digit numeric

**Template Variables**:

- `resetCode`: The 6-digit code
- `expiryMinutes`: Minutes until code expires (default 60)

## Code Generation

```java
public String generateVerificationCode() {
    return String.format("%06d", (int) (Math.random() * 1000000));
}
```

- Generates 0-999999
- Leading zeros preserved (e.g., `000123`)

## Templates

### Directory Structure

```
backend/src/main/resources/templates/email/
├── verification.html       # English verification
├── verification_he.html    # Hebrew verification
├── password-reset.html     # English reset
└── password-reset_he.html  # Hebrew reset
```

### Template Engine

Uses **Thymeleaf** for HTML rendering:

```html
<div class="code" th:text="${verificationCode}">123456</div>
<p th:utext="#{email.verification.expiry(${expiryMinutes})}">
  This code will expire in <strong>15 minutes</strong>
</p>
```

### Template Selection

```java
String templateName = isHebrewLocale(locale) ? "email/verification_he" : "email/verification";
```

Locale determined by user's language preference.

## Internationalization

### Message Properties

Located in `backend/src/main/resources/messages/`:

| Key                            | English                              | Purpose       |
| ------------------------------ | ------------------------------------ | ------------- |
| `email.verification.subject`   | Verify Your Email                    | Subject line  |
| `email.verification.header`    | Welcome to SynchBoard!               | Header text   |
| `email.verification.title`     | Verify Your Email Address            | Title         |
| `email.verification.intro`     | Thank you for registering...         | Introduction  |
| `email.verification.important` | Important:                           | Label         |
| `email.verification.expiry`    | This code will expire in {0} minutes | Expiry notice |
| `email.verification.exactCode` | Enter the code exactly as shown      | Instruction   |
| `email.verification.ignore`    | If you didn't request this...        | Disclaimer    |
| `email.footer.automated`       | This is an automated message...      | Footer        |

### Locale Detection

```java
private boolean isHebrewLocale(Locale locale) {
    return locale != null && "he".equals(locale.getLanguage());
}
```

Hebrew emails use RTL layout and Hebrew templates.

## Gmail API Integration

### Configuration

```java
@Configuration
public class GmailApiConfig {

    @Value("${GMAIL_CLIENT_ID:}")
    private String clientId;

    @Value("${GMAIL_CLIENT_SECRET:}")
    private String clientSecret;

    @Value("${GMAIL_REFRESH_TOKEN:}")
    private String refreshToken;

    @Bean
    public Gmail gmail() {
        if (!isGmailConfigured()) {
            return null; // Email disabled
        }

        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        GoogleCredentials credentials = UserCredentials.newBuilder()
            .setClientId(clientId)
            .setClientSecret(clientSecret)
            .setRefreshToken(refreshToken)
            .build();

        return new Gmail.Builder(httpTransport, GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
            .setApplicationName("SynchBoard")
            .build();
    }
}
```

### Sending Email

```java
// Create MimeMessage
MimeMessage mimeMessage = new MimeMessage(session);
mimeMessage.setFrom(new InternetAddress(senderEmail, fromName));
mimeMessage.addRecipient(Message.RecipientType.TO, new InternetAddress(toEmail));
mimeMessage.setSubject(subject, "UTF-8");
mimeMessage.setContent(htmlContent, "text/html; charset=UTF-8");

// Convert to Gmail API format
ByteArrayOutputStream buffer = new ByteArrayOutputStream();
mimeMessage.writeTo(buffer);
String encodedEmail = Base64.encodeBase64URLSafeString(buffer.toByteArray());

Message message = new Message();
message.setRaw(encodedEmail);

// Send via Gmail API
gmail.users().messages().send("me", message).execute();
```

### Success Detection

Exceptions indicate failure. Successful sends complete without exception.

## Email Flow

### Verification Flow

```
1. User submits registration form
2. AuthService checks if email enabled
3. If enabled:
   a. Create PendingRegistration with code
   b. EmailService.sendVerificationCode()
   c. Return "check email" message
4. If disabled:
   a. Create User directly
   b. Return JWT token
```

### Password Reset Flow

```
1. User submits forgot password form
2. AuthService generates reset code
3. EmailService.sendPasswordResetCode()
4. User receives email with code
5. User submits code + new password
6. AuthService validates and updates
```

## Template Styling

Templates use inline CSS for email client compatibility:

```html
<style>
  .code {
    background-color: #1f2937;
    color: #f3f4f6;
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 8px;
    padding: 20px;
    border-radius: 8px;
  }
</style>
```

### Color Scheme

| Element  | Color                  |
| -------- | ---------------------- |
| Header   | `#3b82f6` (Blue)       |
| Code box | `#1f2937` (Dark gray)  |
| Info box | `#e0f2fe` (Light blue) |
| Text     | `#333333`              |

## Error Handling

| Scenario              | Behavior                      |
| --------------------- | ----------------------------- |
| Credentials missing   | Log warning, return false     |
| API connection error  | Log error, return false       |
| IOException           | Catch exception, return false |

Service failures don't throw exceptions - callers check return value.

## Dependencies

```groovy
// Gmail REST API
implementation 'com.google.apis:google-api-services-gmail:v1-rev20220404-2.0.0'
implementation 'com.google.auth:google-auth-library-oauth2-http:1.23.0'

// For MimeMessage helper classes only (not SMTP)
implementation 'org.springframework.boot:spring-boot-starter-mail'

// Template rendering
implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
```

## Key Files

| File                                           | Purpose                       |
| ---------------------------------------------- | ----------------------------- |
| `config/email/GmailApiConfig.java`             | Gmail API client configuration|
| `service/auth/EmailService.java`               | Email sending logic           |
| `templates/email/verification.html`            | English verification template |
| `templates/email/verification_he.html`         | Hebrew verification template  |
| `templates/email/password-reset.html`          | English reset template        |
| `templates/email/password-reset_he.html`       | Hebrew reset template         |
| `messages/messages.properties`                 | English strings               |
| `messages/messages_he.properties`              | Hebrew strings                |

## Testing Locally

Without Gmail API credentials:

1. Leave `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, and `GMAIL_SENDER_EMAIL` unset
2. Registration works without verification
3. Password reset is unavailable

With Gmail API credentials:

1. Follow the setup steps above to obtain OAuth2 credentials
2. Set all four Gmail environment variables
3. Email verification and password reset will be fully functional

## Troubleshooting

### Emails not sending

1. Check all Gmail environment variables are set correctly
2. Verify the refresh token is valid (regenerate if expired)
3. Ensure the Gmail API is enabled in Google Cloud Console
4. Ensure your Gmail account is added as a test user (for External apps)
5. Review backend logs for API errors

### Authentication failed

1. Regenerate the refresh token using OAuth 2.0 Playground
2. Verify Client ID and Client Secret match your Google Cloud credentials
3. Check that the Gmail API scope is correctly authorized

### Token expired

Refresh tokens can expire if:

1. The app has been unused for 6 months
2. The user revoked access
3. The app is still in "Testing" mode and the token is older than 7 days

Solution: Regenerate the refresh token following Step 4 above.

### Wrong language

1. Check user's language preference in database
2. Verify message properties files exist
3. Check template files for locale

### Code expired

1. Adjust `VERIFICATION_EXPIRY_MINUTES` (default 15)
2. Adjust `PASSWORD_RESET_EXPIRY_MINUTES` (default 60)

## Publishing Your App (Production)

For production use, you should publish your OAuth consent screen:

1. Go to **OAuth consent screen** in Google Cloud Console
2. Click **PUBLISH APP**
3. Complete Google's verification process (may require verification for sensitive scopes)

Until published, only test users can authorize the app, and refresh tokens expire after 7 days.
