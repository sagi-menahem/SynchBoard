package io.github.sagimenahem.synchboard.constants;

public final class LoggingConstants {

    private LoggingConstants() {
        throw new UnsupportedOperationException("Constants class");
    }


    public static final String SECURITY_PREFIX = "[SECURITY]";

    public static final String CRITICAL_PREFIX = "[CRITICAL]";

    public static final String AUDIT_PREFIX = "[AUDIT]";

    public static final String WEBSOCKET_PREFIX = "[WEBSOCKET]";

    public static final String DATA_PREFIX = "[DATA]";

    public static final String FILE_PREFIX = "[FILE]";


    public static final String AUTH_LOGIN_ATTEMPT = SECURITY_PREFIX + " Login attempt for user: {}";
    public static final String AUTH_LOGIN_SUCCESS =
            SECURITY_PREFIX + " Login successful for user: {}";
    public static final String AUTH_LOGIN_FAILED =
            SECURITY_PREFIX + " Login failed for user: {}. Reason: {}";
    public static final String AUTH_REGISTER_ATTEMPT =
            SECURITY_PREFIX + " Registration attempt for email: {}";
    public static final String AUTH_REGISTER_SUCCESS =
            SECURITY_PREFIX + " Registration successful for user: {}";
    public static final String AUTH_REGISTER_FAILED =
            SECURITY_PREFIX + " Registration failed for email: {}. Reason: {}";
    public static final String AUTH_TOKEN_GENERATED =
            SECURITY_PREFIX + " JWT token generated for user: {}";
    public static final String AUTH_TOKEN_VALIDATED =
            SECURITY_PREFIX + " JWT token validated for user: {}";
    public static final String AUTH_TOKEN_INVALID =
            SECURITY_PREFIX + " Invalid JWT token for user: {}. Reason: {}";
    public static final String AUTH_PASSWORD_CHANGED =
            SECURITY_PREFIX + " Password changed for user: {}";
    public static final String AUTH_ACCESS_DENIED =
            SECURITY_PREFIX + " Access denied for user: {} to resource: {}";
    public static final String AUTH_ACCESS_GRANTED =
            SECURITY_PREFIX + " Access granted for user: {} to resource: {}";

    public static final String BOARD_CREATED =
            DATA_PREFIX + " Board created. ID: {}, Name: {}, Creator: {}";
    public static final String BOARD_UPDATED =
            DATA_PREFIX + " Board updated. ID: {}, Field: {}, User: {}";
    public static final String BOARD_ACCESS_ATTEMPT =
            SECURITY_PREFIX + " Board access attempt. BoardId: {}, User: {}";
    public static final String BOARD_ACCESS_GRANTED =
            SECURITY_PREFIX + " Board access granted. BoardId: {}, User: {}";
    public static final String BOARD_ACCESS_DENIED =
            SECURITY_PREFIX + " Board access denied. BoardId: {}, User: {}";
    public static final String BOARD_MEMBER_ADDED =
            AUDIT_PREFIX + " Member added to board. BoardId: {}, Member: {}, AddedBy: {}";
    public static final String BOARD_MEMBER_REMOVED =
            AUDIT_PREFIX + " Member removed from board. BoardId: {}, Member: {}, RemovedBy: {}";
    public static final String BOARD_MEMBER_PROMOTED =
            AUDIT_PREFIX + " Member promoted in board. BoardId: {}, Member: {}, PromotedBy: {}";
    public static final String BOARD_MEMBER_LEFT =
            AUDIT_PREFIX + " Member left board. BoardId: {}, Member: {}";

    public static final String USER_PROFILE_UPDATED =
            DATA_PREFIX + " User profile updated. User: {}, Fields: {}";
    public static final String USER_PROFILE_FETCHED =
            DATA_PREFIX + " User profile fetched. User: {}";
    public static final String USER_ACCOUNT_DELETED =
            CRITICAL_PREFIX + " User account deleted. User: {}";
    public static final String USER_PREFERENCES_UPDATED =
            DATA_PREFIX + " User preferences updated. User: {}";
    public static final String USER_NOT_FOUND = DATA_PREFIX + " User not found. Email: {}";

    public static final String WEBSOCKET_MESSAGE_SENT =
            WEBSOCKET_PREFIX + " Message sent. Type: {}, BoardId: {}, User: {}";
    public static final String WEBSOCKET_MESSAGE_RECEIVED =
            WEBSOCKET_PREFIX + " Message received. Type: {}, BoardId: {}, User: {}";

    public static final String FILE_UPLOAD_STARTED =
            FILE_PREFIX + " File upload started. Filename: {}, User: {}, Size: {} bytes";
    public static final String FILE_UPLOAD_SUCCESS =
            FILE_PREFIX + " File uploaded successfully. Path: {}, User: {}";
    public static final String FILE_UPLOAD_FAILED =
            FILE_PREFIX + " File upload failed. Filename: {}, User: {}, Reason: {}";
    public static final String FILE_DELETE_SUCCESS =
            FILE_PREFIX + " File deleted. Path: {}, User: {}";
    public static final String FILE_DELETE_FAILED =
            FILE_PREFIX + " File deletion failed. Path: {}, Reason: {}";
    public static final String FILE_VALIDATION_FAILED =
            FILE_PREFIX + " File validation failed. Filename: {}, Reason: {}";

    public static final String API_REQUEST_RECEIVED =
            "[API] Request received. Method: {}, Path: {}, User: {}";
    public static final String API_REQUEST_COMPLETED =
            "[API] Request completed. Method: {}, Path: {}, User: {}, Duration: {}ms";
    public static final String API_REQUEST_FAILED =
            "[API] Request failed. Method: {}, Path: {}, User: {}, Error: {}";

    public static final String ERROR_VALIDATION =
            "Validation error. Field: {}, Value: {}, Constraint: {}";

    public static final String ACTION_UNDO =
            AUDIT_PREFIX + " Undo action. BoardId: {}, User: {}, ActionType: {}";
    public static final String ACTION_REDO =
            AUDIT_PREFIX + " Redo action. BoardId: {}, User: {}, ActionType: {}";
    public static final String ACTION_SAVED =
            DATA_PREFIX + " Action saved. BoardId: {}, User: {}, ActionType: {}";

    public static final String CHAT_MESSAGE_SENT =
            DATA_PREFIX + " Chat message sent. BoardId: {}, User: {}, MessageId: {}";
}
