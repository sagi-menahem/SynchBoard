# Email Service

This document describes the email service in SynchBoard, including configuration, templates, and internationalization.

## Overview

SynchBoard uses **SendGrid** for transactional emails:

- Email verification during registration
- Password reset codes

Email functionality is **optional** - if not configured, registration proceeds without verification.

## Configuration

### Environment Variables

| Variable                        | Required  | Default                | Description                |
| ------------------------------- | --------- | ---------------------- | -------------------------- |
| `SENDGRID_API_KEY`              | For email | -                      | SendGrid API key           |
| `SENDGRID_FROM_EMAIL`           | No        | noreply@synchboard.com | Sender email               |
| `SENDGRID_FROM_NAME`            | No        | SynchBoard Team        | Sender display name        |
| `VERIFICATION_EXPIRY_MINUTES`   | No        | 15                     | Verification code lifetime |
| `PASSWORD_RESET_EXPIRY_MINUTES` | No        | 60                     | Reset code lifetime        |

### Feature Detection

```java
public boolean isEmailEnabled() {
  return sendGridApiKey != null && !sendGridApiKey.trim().isEmpty();
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

## SendGrid Integration

### API Call

```java
Email from = new Email(fromEmail, fromName);
Email to = new Email(toEmail);
Content content = new Content("text/html", body);
Mail mail = new Mail(from, subject, to, content);

SendGrid sg = new SendGrid(sendGridApiKey);
Request request = new Request();
request.setMethod(Method.POST);
request.setEndpoint("mail/send");
request.setBody(mail.build());

Response response = sg.api(request);
```

### Success Detection

```java
if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
    return true;
}
```

HTTP 2xx status codes indicate success.

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

| Scenario        | Behavior                      |
| --------------- | ----------------------------- |
| API key missing | Log warning, return false     |
| SendGrid error  | Log error, return false       |
| IOException     | Catch exception, return false |

Service failures don't throw exceptions - callers check return value.

## Dependencies

```groovy
implementation 'com.sendgrid:sendgrid-java:4.10.3'
implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
```

## Key Files

| File                                     | Purpose                       |
| ---------------------------------------- | ----------------------------- |
| `service/auth/EmailService.java`         | Email sending logic           |
| `templates/email/verification.html`      | English verification template |
| `templates/email/verification_he.html`   | Hebrew verification template  |
| `templates/email/password-reset.html`    | English reset template        |
| `templates/email/password-reset_he.html` | Hebrew reset template         |
| `messages/messages.properties`           | English strings               |
| `messages/messages_he.properties`        | Hebrew strings                |

## Testing Locally

Without SendGrid:

1. Leave `SENDGRID_API_KEY` unset
2. Registration works without verification
3. Password reset unavailable

With SendGrid:

1. Create SendGrid account
2. Generate API key with Mail Send permission
3. Set `SENDGRID_API_KEY` in `.env`
4. Set `SENDGRID_FROM_EMAIL` to verified sender

## Troubleshooting

### Emails not sending

1. Check `SENDGRID_API_KEY` is set
2. Verify sender email in SendGrid
3. Check SendGrid account status
4. Review backend logs for errors

### Wrong language

1. Check user's language preference in database
2. Verify message properties files exist
3. Check template files for locale

### Code expired

1. Adjust `VERIFICATION_EXPIRY_MINUTES` (default 15)
2. Adjust `PASSWORD_RESET_EXPIRY_MINUTES` (default 60)
