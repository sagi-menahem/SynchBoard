package io.github.sagimenahem.synchboard.constants;

/**
 * Logging constants providing structured log message templates and prefixes for consistent
 * application-wide logging. These constants enable categorized, searchable, and analyzable logs
 * across all application components including security, audit, data operations, WebSocket
 * communications, and file operations. All log messages use SLF4J parameterized formatting for
 * performance and security.
 *
 * @author Sagi Menahem
 */
public final class LoggingConstants {

    private LoggingConstants() {
        throw new UnsupportedOperationException("Constants class");
    }

    // Log Category Prefixes

    /**
     * Log prefix for security-related events. Used for authentication, authorization, and access
     * control logging.
     */
    public static final String SECURITY_PREFIX = "[SECURITY]";

    /**
     * Log prefix for critical system events. Used for high-severity events requiring immediate
     * attention.
     */
    public static final String CRITICAL_PREFIX = "[CRITICAL]";

    /**
     * Log prefix for audit trail events. Used for tracking user actions and system changes for
     * compliance.
     */
    public static final String AUDIT_PREFIX = "[AUDIT]";

    /**
     * Log prefix for WebSocket communication events. Used for real-time communication monitoring
     * and troubleshooting.
     */
    public static final String WEBSOCKET_PREFIX = "[WEBSOCKET]";

    /**
     * Log prefix for data operation events. Used for database operations, entity changes, and data
     * processing.
     */
    public static final String DATA_PREFIX = "[DATA]";

    /**
     * Log prefix for file operation events. Used for upload, download, validation, and storage
     * operations.
     */
    public static final String FILE_PREFIX = "[FILE]";

    /**
     * Log prefix for diagnostic/debugging events. Used for temporary troubleshooting and tracing
     * message flow through the system.
     */
    public static final String DIAGNOSTIC_PREFIX = "[DIAGNOSTIC]";

    // Authentication and Authorization Log Messages

    /**
     * Log message template for user login attempts. Parameters: username/email
     */
    public static final String AUTH_LOGIN_ATTEMPT = SECURITY_PREFIX + " Login attempt for user: {}";

    /**
     * Log message template for successful user authentication. Parameters: username/email
     */
    public static final String AUTH_LOGIN_SUCCESS = SECURITY_PREFIX + " Login successful for user: {}";

    /**
     * Log message template for failed authentication attempts. Parameters: username/email, failure
     * reason
     */
    public static final String AUTH_LOGIN_FAILED = SECURITY_PREFIX + " Login failed for user: {}. Reason: {}";

    /**
     * Log message template for user registration attempts. Parameters: email address
     */
    public static final String AUTH_REGISTER_ATTEMPT = SECURITY_PREFIX + " Registration attempt for email: {}";

    /**
     * Log message template for successful user registration. Parameters: username/email
     */
    public static final String AUTH_REGISTER_SUCCESS = SECURITY_PREFIX + " Registration successful for user: {}";

    /**
     * Log message template for failed registration attempts. Parameters: email address, failure
     * reason
     */
    public static final String AUTH_REGISTER_FAILED =
        SECURITY_PREFIX + " Registration failed for email: {}. Reason: {}";

    /**
     * Log message template for JWT token generation. Parameters: username/email
     */
    public static final String AUTH_TOKEN_GENERATED = SECURITY_PREFIX + " JWT token generated for user: {}";

    /**
     * Log message template for successful JWT token validation. Parameters: username/email
     */
    public static final String AUTH_TOKEN_VALIDATED = SECURITY_PREFIX + " JWT token validated for user: {}";

    /**
     * Log message template for invalid JWT token attempts. Parameters: username/email, validation
     * failure reason
     */
    public static final String AUTH_TOKEN_INVALID = SECURITY_PREFIX + " Invalid JWT token for user: {}. Reason: {}";

    /**
     * Log message template for password change operations. Parameters: username/email
     */
    public static final String AUTH_PASSWORD_CHANGED = SECURITY_PREFIX + " Password changed for user: {}";

    /**
     * Log message template for access denied events. Parameters: username/email, requested resource
     */
    public static final String AUTH_ACCESS_DENIED = SECURITY_PREFIX + " Access denied for user: {} to resource: {}";

    /**
     * Log message template for access granted events. Parameters: username/email, accessed resource
     */
    public static final String AUTH_ACCESS_GRANTED = SECURITY_PREFIX + " Access granted for user: {} to resource: {}";

    // Board Operation Log Messages

    /**
     * Log message template for board creation events. Parameters: board ID, board name, creator
     * username
     */
    public static final String BOARD_CREATED = DATA_PREFIX + " Board created. ID: {}, Name: {}, Creator: {}";

    /**
     * Log message template for board update events. Parameters: board ID, updated field, user who
     * made the update
     */
    public static final String BOARD_UPDATED = DATA_PREFIX + " Board updated. ID: {}, Field: {}, User: {}";

    /**
     * Log message template for board access attempts. Parameters: board ID, username attempting
     * access
     */
    public static final String BOARD_ACCESS_ATTEMPT = SECURITY_PREFIX + " Board access attempt. BoardId: {}, User: {}";

    /**
     * Log message template for granted board access. Parameters: board ID, username granted access
     */
    public static final String BOARD_ACCESS_GRANTED = SECURITY_PREFIX + " Board access granted. BoardId: {}, User: {}";

    /**
     * Log message template for denied board access. Parameters: board ID, username denied access
     */
    public static final String BOARD_ACCESS_DENIED = SECURITY_PREFIX + " Board access denied. BoardId: {}, User: {}";

    // Board Membership Log Messages

    /**
     * Log message template for board member additions. Parameters: board ID, added member email,
     * user who added them
     */
    public static final String BOARD_MEMBER_ADDED =
        AUDIT_PREFIX + " Member added to board. BoardId: {}, Member: {}, AddedBy: {}";

    /**
     * Log message template for board member removals. Parameters: board ID, removed member email,
     * user who removed them
     */
    public static final String BOARD_MEMBER_REMOVED =
        AUDIT_PREFIX + " Member removed from board. BoardId: {}, Member: {}, RemovedBy: {}";

    /**
     * Log message template for board member promotions. Parameters: board ID, promoted member
     * email, user who promoted them
     */
    public static final String BOARD_MEMBER_PROMOTED =
        AUDIT_PREFIX + " Member promoted in board. BoardId: {}, Member: {}, PromotedBy: {}";

    /**
     * Log message template for members leaving boards. Parameters: board ID, member who left
     */
    public static final String BOARD_MEMBER_LEFT = AUDIT_PREFIX + " Member left board. BoardId: {}, Member: {}";

    // User Profile Log Messages

    /**
     * Log message template for user profile updates. Parameters: username, list of updated fields
     */
    public static final String USER_PROFILE_UPDATED = DATA_PREFIX + " User profile updated. User: {}, Fields: {}";

    /**
     * Log message template for user profile retrieval. Parameters: username
     */
    public static final String USER_PROFILE_FETCHED = DATA_PREFIX + " User profile fetched. User: {}";

    /**
     * Log message template for user account deletion (critical event). Parameters: username
     */
    public static final String USER_ACCOUNT_DELETED = CRITICAL_PREFIX + " User account deleted. User: {}";

    /**
     * Log message template for user preferences updates. Parameters: username
     */
    public static final String USER_PREFERENCES_UPDATED = DATA_PREFIX + " User preferences updated. User: {}";

    /**
     * Log message template for user preferences retrieval. Parameters: username
     */
    public static final String USER_PREFERENCES_FETCHED = DATA_PREFIX + " User preferences fetched. User: {}";

    /**
     * Log message template for user not found scenarios. Parameters: email address
     */
    public static final String USER_NOT_FOUND = DATA_PREFIX + " User not found. Email: {}";

    // WebSocket Communication Log Messages

    /**
     * Log message template for outbound WebSocket messages. Parameters: message type, board ID,
     * sender username
     */
    public static final String WEBSOCKET_MESSAGE_SENT =
        WEBSOCKET_PREFIX + " Message sent. Type: {}, BoardId: {}, User: {}";

    /**
     * Log message template for inbound WebSocket messages. Parameters: message type, board ID,
     * sender username
     */
    public static final String WEBSOCKET_MESSAGE_RECEIVED =
        WEBSOCKET_PREFIX + " Message received. Type: {}, BoardId: {}, User: {}";

    // File Operation Log Messages

    /**
     * Log message template for file upload initiation. Parameters: filename, uploader username,
     * file size in bytes
     */
    public static final String FILE_UPLOAD_STARTED =
        FILE_PREFIX + " File upload started. Filename: {}, User: {}, Size: {} bytes";

    /**
     * Log message template for successful file uploads. Parameters: file path, uploader username
     */
    public static final String FILE_UPLOAD_SUCCESS = FILE_PREFIX + " File uploaded successfully. Path: {}, User: {}";

    /**
     * Log message template for failed file uploads. Parameters: filename, uploader username,
     * failure reason
     */
    public static final String FILE_UPLOAD_FAILED =
        FILE_PREFIX + " File upload failed. Filename: {}, User: {}, Reason: {}";

    /**
     * Log message template for successful file deletions. Parameters: file path, user who deleted
     */
    public static final String FILE_DELETE_SUCCESS = FILE_PREFIX + " File deleted. Path: {}, User: {}";

    /**
     * Log message template for failed file deletions. Parameters: file path, failure reason
     */
    public static final String FILE_DELETE_FAILED = FILE_PREFIX + " File deletion failed. Path: {}, Reason: {}";

    /**
     * Log message template for file validation failures. Parameters: filename, validation failure
     * reason
     */
    public static final String FILE_VALIDATION_FAILED =
        FILE_PREFIX + " File validation failed. Filename: {}, Reason: {}";

    // API Request Log Messages

    /**
     * Log message template for API request initiation. Parameters: HTTP method, request path,
     * authenticated user
     */
    public static final String API_REQUEST_RECEIVED = "[API] Request received. Method: {}, Path: {}, User: {}";

    /**
     * Log message template for completed API requests. Parameters: HTTP method, request path,
     * authenticated user, duration in milliseconds
     */
    public static final String API_REQUEST_COMPLETED =
        "[API] Request completed. Method: {}, Path: {}, User: {}, Duration: {}ms";

    /**
     * Log message template for failed API requests. Parameters: HTTP method, request path,
     * authenticated user, error details
     */
    public static final String API_REQUEST_FAILED = "[API] Request failed. Method: {}, Path: {}, User: {}, Error: {}";

    // Action History Log Messages

    /**
     * Log message template for undo operations. Parameters: board ID, user performing undo, action
     * type being undone
     */
    public static final String ACTION_UNDO = AUDIT_PREFIX + " Undo action. BoardId: {}, User: {}, ActionType: {}";

    /**
     * Log message template for redo operations. Parameters: board ID, user performing redo, action
     * type being redone
     */
    public static final String ACTION_REDO = AUDIT_PREFIX + " Redo action. BoardId: {}, User: {}, ActionType: {}";

    /**
     * Log message template for action persistence. Parameters: board ID, user who performed action,
     * action type
     */
    public static final String ACTION_SAVED = DATA_PREFIX + " Action saved. BoardId: {}, User: {}, ActionType: {}";

    // Chat System Log Messages

    /**
     * Log message template for chat message sending. Parameters: board ID, sender username, message
     * ID
     */
    public static final String CHAT_MESSAGE_SENT =
        DATA_PREFIX + " Chat message sent. BoardId: {}, User: {}, MessageId: {}";

    // General Error Log Messages

    /**
     * Log message template for validation errors. Parameters: field name, field value, violated
     * constraint
     */
    public static final String ERROR_VALIDATION = "Validation error. Field: {}, Value: {}, Constraint: {}";
}
