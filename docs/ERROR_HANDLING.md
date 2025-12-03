# Error Handling

This document describes the error handling architecture in SynchBoard, including exception types, HTTP status codes, error responses, and frontend handling.

## Backend Error Architecture

### Exception Hierarchy

| Exception | HTTP Status | Purpose |
|-----------|-------------|---------|
| `ResourceNotFoundException` | 404 | Entity not found in database |
| `ResourceConflictException` | 409 | Duplicate or conflicting data |
| `InvalidRequestException` | 400 | Invalid input or business rule violation |
| `AccessDeniedException` | 403 | Insufficient permissions |
| `BadCredentialsException` | 401 | Invalid login credentials |
| `MethodArgumentNotValidException` | 400 | Bean validation failure |
| `Exception` (fallback) | 500 | Unexpected errors |

### Global Exception Handler

Located at `exception/GlobalExceptionHandler.java`:

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceNotFoundException(
        ResourceNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // ... other handlers
}
```

All exceptions are logged with appropriate severity before response generation.

### Error Response Format

```java
public class ErrorResponseDTO {
    private String message;        // Human-readable message
    private String errorCode;      // Programmatic error code
    private Integer statusCode;    // HTTP status
    private String details;        // Technical details
    private LocalDateTime timestamp; // When error occurred
}
```

Example response:

```json
{
  "message": "User not found",
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00"
}
```

## Custom Exceptions

### ResourceNotFoundException

Thrown when an entity is not found:

```java
throw new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + email);
throw new ResourceNotFoundException(MessageConstants.BOARD_NOT_FOUND + boardId);
```

### ResourceConflictException

Thrown for duplicate data:

```java
throw new ResourceConflictException(MessageConstants.USER_ALREADY_MEMBER);
throw new ResourceConflictException(MessageConstants.USER_IS_ALREADY_ADMIN);
throw new ResourceConflictException(MessageConstants.EMAIL_IN_USE);
```

### InvalidRequestException

Thrown for invalid requests:

```java
throw new InvalidRequestException(MessageConstants.CANNOT_INVITE_SELF);
throw new InvalidRequestException(MessageConstants.BOARD_CANNOT_REMOVE_SELF);
throw new InvalidRequestException(MessageConstants.PASSWORD_SAME_AS_OLD);
```

## Message Constants

Error messages are centralized in `MessageConstants.java`:

### Authentication

| Constant | Value | Purpose |
|----------|-------|---------|
| `AUTH_BAD_CREDENTIALS` | auth.badCredentials | Invalid login |
| `AUTH_FAILED_TRY_AGAIN` | auth.failedTryAgain | General auth failure |
| `AUTH_EMAIL_ALREADY_REGISTERED` | auth.emailAlreadyRegistered | Duplicate registration |
| `AUTH_NOT_ADMIN` | error.auth.notAdmin | Not an admin |
| `AUTH_NOT_MEMBER` | error.auth.notMember | Not a board member |

### User

| Constant | Value | Purpose |
|----------|-------|---------|
| `USER_NOT_FOUND` | error.user.notFound | User doesn't exist |
| `USER_ALREADY_MEMBER` | error.user.alreadyMember | Already board member |
| `CANNOT_INVITE_SELF` | error.user.cannotInviteSelf | Self-invitation |
| `USER_IS_ALREADY_ADMIN` | error.user.alreadyAdmin | Already admin |

### Board

| Constant | Value | Purpose |
|----------|-------|---------|
| `BOARD_NOT_FOUND` | error.board.notFound | Board doesn't exist |
| `BOARD_NAME_CANT_BE_EMPTY` | error.board.nameCannotBeEmpty | Empty name |
| `BOARD_NAME_LENGTH` | error.board.nameLength | Invalid name length |
| `BOARD_CANNOT_REMOVE_SELF` | error.board.cannotRemoveSelf | Self-removal |

### Validation

| Constant | Value | Purpose |
|----------|-------|---------|
| `ERROR_EMAIL_CANT_BE_EMPTY` | error.email.cannotBeEmpty | Empty email |
| `ERROR_EMAIL_SHOULD_BE_VALID` | error.email.shouldBeValid | Invalid email |
| `ERROR_PASSWORD_CANT_BE_EMPTY` | error.password.cannotBeEmpty | Empty password |

### General

| Constant | Value | Purpose |
|----------|-------|---------|
| `UNEXPECTED_ERROR` | error.unexpected | Fallback error |
| `PASSWORD_INCORRECT` | password.incorrect | Wrong password |
| `PASSWORD_SAME_AS_OLD` | password.sameAsOld | Password unchanged |

## Bean Validation Errors

Validation annotations trigger `MethodArgumentNotValidException`:

```java
public class CreateBoardRequest {
    @NotBlank(message = MessageConstants.BOARD_NAME_CANT_BE_EMPTY)
    @Size(min = BOARD_NAME_MIN_LENGTH, max = BOARD_NAME_MAX_LENGTH,
          message = MessageConstants.BOARD_NAME_LENGTH)
    private String name;
}
```

Handler aggregates all validation errors:

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorResponseDTO> handleValidationExceptions(
    MethodArgumentNotValidException ex) {
    String errorMessage = ex.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(error -> error.getDefaultMessage())
        .collect(Collectors.joining(", "));
    return buildErrorResponse(HttpStatus.BAD_REQUEST, errorMessage);
}
```

## Validation Limits

Defined in `MessageConstants.java`:

| Constant | Value | Purpose |
|----------|-------|---------|
| `BOARD_NAME_MIN_LENGTH` | 3 | Min board name |
| `BOARD_NAME_MAX_LENGTH` | 100 | Max board name |
| `CANVAS_WIDTH_MIN` | 400 | Min canvas width |
| `CANVAS_WIDTH_MAX` | 4000 | Max canvas width |
| `CANVAS_HEIGHT_MIN` | 300 | Min canvas height |
| `CANVAS_HEIGHT_MAX` | 4000 | Max canvas height |
| `CANVAS_CHAT_SPLIT_RATIO_MIN` | 30 | Min split ratio |
| `CANVAS_CHAT_SPLIT_RATIO_MAX` | 70 | Max split ratio |
| `DEFAULT_STROKE_WIDTH_MIN` | 1 | Min stroke width |
| `DEFAULT_STROKE_WIDTH_MAX` | 50 | Max stroke width |

## WebSocket Errors

WebSocket errors are sent via user-specific topics:

```java
messagingTemplate.convertAndSendToUser(
    userEmail,
    "/topic/errors",
    new ErrorResponseDTO("Failed to send message", "CHAT_ERROR")
);
```

Spring STOMP translates to `/user/queue/errors` for user-specific delivery.

## Frontend Error Handling

### API Client

Axios interceptor handles 401 responses:

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

### Toast Notifications

User-facing errors use `react-hot-toast`:

```typescript
try {
  await boardService.updateBoard(data);
  toast.success(t('board:success.updated'));
} catch (error) {
  toast.error(t('board:errors.updateFailed'));
}
```

### Error Display Patterns

| Scenario | Display Method |
|----------|----------------|
| API errors | Toast notification |
| Validation errors | Form field errors |
| Network errors | Toast notification |
| Auth errors | Redirect to login |
| WebSocket errors | Toast notification |

## Logging

Backend uses structured logging:

```java
log.warn("Resource not found: {}", ex.getMessage());
log.error("An unexpected error occurred", ex);
log.warn(LoggingConstants.AUTH_LOGIN_FAILED, "unknown", ex.getMessage());
```

Log levels:
- `ERROR`: Unexpected exceptions (500)
- `WARN`: Expected exceptions (400, 403, 404, 409)
- `DEBUG`: Detailed troubleshooting

## HTTP Status Code Summary

| Status | Exception | Meaning |
|--------|-----------|---------|
| 200 | - | Success |
| 201 | - | Created |
| 204 | - | No Content |
| 400 | `InvalidRequestException`, validation | Bad request |
| 401 | `BadCredentialsException` | Unauthorized |
| 403 | `AccessDeniedException` | Forbidden |
| 404 | `ResourceNotFoundException` | Not found |
| 409 | `ResourceConflictException` | Conflict |
| 500 | `Exception` | Server error |

## Key Files

### Backend

| File | Purpose |
|------|---------|
| `exception/GlobalExceptionHandler.java` | Centralized handler |
| `exception/ResourceNotFoundException.java` | 404 exception |
| `exception/ResourceConflictException.java` | 409 exception |
| `exception/InvalidRequestException.java` | 400 exception |
| `dto/error/ErrorResponseDTO.java` | Error response format |
| `constants/MessageConstants.java` | Error message keys |

### Frontend

| File | Purpose |
|------|---------|
| `shared/lib/apiClient.ts` | HTTP error handling |
| `locales/en/validation.json` | English error messages |
| `locales/he/validation.json` | Hebrew error messages |

## Best Practices

1. **Use specific exceptions** - Choose the most appropriate exception type
2. **Include context** - Provide meaningful error messages
3. **Log appropriately** - Use correct log levels
4. **Handle gracefully** - Don't expose stack traces to users
5. **Use message constants** - Centralize error messages for i18n
6. **Validate early** - Use bean validation annotations
7. **Toast for feedback** - Use toasts for user-facing errors
