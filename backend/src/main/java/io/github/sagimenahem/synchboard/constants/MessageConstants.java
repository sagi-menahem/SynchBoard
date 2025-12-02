package io.github.sagimenahem.synchboard.constants;

/**
 * Message constants and validation limits used throughout the SynchBoard application. This class
 * centralizes error message keys, validation constraints, and business rules to ensure consistency
 * across the application. Message keys are designed for internationalization (i18n) support and are
 * resolved through the message source system.
 *
 * @author Sagi Menahem
 */
public final class MessageConstants {

    private MessageConstants() {}

    // Input Validation Error Messages

    /**
     * Error message key for empty email validation. Used when email field is required but not
     * provided.
     */
    public static final String ERROR_EMAIL_CANT_BE_EMPTY = "error.email.cannotBeEmpty";

    /**
     * Error message key for invalid email format validation. Used when email format doesn't match
     * standard email patterns.
     */
    public static final String ERROR_EMAIL_SHOULD_BE_VALID = "error.email.shouldBeValid";

    /**
     * Error message key for empty password validation. Used when password field is required but not
     * provided.
     */
    public static final String ERROR_PASSWORD_CANT_BE_EMPTY = "error.password.cannotBeEmpty";

    // Board Validation Messages and Constraints

    /**
     * Error message key for empty board name validation. Used when board name is required during
     * board creation or updates.
     */
    public static final String BOARD_NAME_CANT_BE_EMPTY = "error.board.nameCannotBeEmpty";

    /**
     * Error message key for invalid board name length. Used when board name doesn't meet minimum or
     * maximum length requirements.
     */
    public static final String BOARD_NAME_LENGTH = "error.board.nameLength";

    // Business Rule Validation Limits

    /**
     * Minimum allowed length for board names in characters. Ensures board names are meaningful and
     * identifiable.
     */
    public static final int BOARD_NAME_MIN_LENGTH = 3;

    /**
     * Maximum allowed length for board names in characters. Prevents excessively long names that
     * could impact UI layout.
     */
    public static final int BOARD_NAME_MAX_LENGTH = 100;

    /**
     * Minimum canvas width constraint in pixels. Ensures canvas remains usable on smaller displays.
     */
    public static final int CANVAS_WIDTH_MIN = 400;

    /**
     * Maximum canvas width constraint in pixels. Prevents performance issues with oversized
     * canvases.
     */
    public static final int CANVAS_WIDTH_MAX = 4000;

    /**
     * Minimum canvas height constraint in pixels. Provides adequate space for drawing operations.
     */
    public static final int CANVAS_HEIGHT_MIN = 300;

    /**
     * Maximum canvas height constraint in pixels. Balances functionality with system resource
     * usage.
     */
    public static final int CANVAS_HEIGHT_MAX = 4000;

    /**
     * Minimum canvas-chat split ratio as a percentage. Ensures chat area remains visible and
     * functional.
     */
    public static final int CANVAS_CHAT_SPLIT_RATIO_MIN = 30;

    /**
     * Maximum canvas-chat split ratio as a percentage. Ensures chat area maintains minimum usable
     * size.
     */
    public static final int CANVAS_CHAT_SPLIT_RATIO_MAX = 70;

    /**
     * Minimum stroke width for drawing tools in pixels. Ensures drawn lines remain visible.
     */
    public static final int DEFAULT_STROKE_WIDTH_MIN = 1;

    /**
     * Maximum stroke width for drawing tools in pixels. Prevents excessively thick lines that could
     * impact canvas performance.
     */
    public static final int DEFAULT_STROKE_WIDTH_MAX = 50;

    // Entity Not Found Error Messages

    /**
     * Error message key for user not found scenarios. Used when attempting to access or reference a
     * non-existent user.
     */
    public static final String USER_NOT_FOUND = "error.user.notFound";

    /**
     * Error message key for board not found scenarios. Used when attempting to access or reference
     * a non-existent board.
     */
    public static final String BOARD_NOT_FOUND = "error.board.notFound";

    // Business Logic Error Messages

    /**
     * Error message key for email already in use validation. Used during registration when email is
     * already associated with an account.
     */
    public static final String EMAIL_IN_USE = "error.email.inUse";

    /**
     * Error message key for duplicate board membership. Used when attempting to invite a user who
     * is already a board member.
     */
    public static final String USER_ALREADY_MEMBER = "error.user.alreadyMember";

    /**
     * Error message key for self-invitation prevention. Used when a user attempts to invite
     * themselves to a board.
     */
    public static final String CANNOT_INVITE_SELF = "error.user.cannotInviteSelf";

    // Authorization Error Messages

    /**
     * Error message key for insufficient admin privileges. Used when non-admin users attempt
     * admin-only operations.
     */
    public static final String AUTH_NOT_ADMIN = "error.auth.notAdmin";

    /**
     * Error message key for non-member access attempts. Used when users attempt to access boards
     * they're not members of.
     */
    public static final String AUTH_NOT_MEMBER = "error.auth.notMember";

    // Board Management Error Messages

    /**
     * Error message key for self-removal prevention. Used when board owners attempt to remove
     * themselves from boards.
     */
    public static final String BOARD_CANNOT_REMOVE_SELF = "error.board.cannotRemoveSelf";

    /**
     * Error message key for duplicate admin promotion. Used when attempting to promote a user who
     * is already an admin.
     */
    public static final String USER_IS_ALREADY_ADMIN = "error.user.alreadyAdmin";

    // Authentication Error Messages

    /**
     * Error message key for incorrect password validation. Used during login and password change
     * operations.
     */
    public static final String PASSWORD_INCORRECT = "password.incorrect";

    /**
     * Error message key for password reuse prevention. Used when users attempt to change password
     * to their current password.
     */
    public static final String PASSWORD_SAME_AS_OLD = "password.sameAsOld";

    /**
     * Error message key for invalid login credentials. Used during authentication when credentials
     * don't match any account.
     */
    public static final String AUTH_BAD_CREDENTIALS = "auth.badCredentials";

    /**
     * Error message key for general authentication failures. Used as fallback for authentication
     * errors requiring retry.
     */
    public static final String AUTH_FAILED_TRY_AGAIN = "auth.failedTryAgain";

    /**
     * Error message key for duplicate email registration. Used when attempting to register with an
     * already registered email.
     */
    public static final String AUTH_EMAIL_ALREADY_REGISTERED = "auth.emailAlreadyRegistered";

    // User Profile Validation Messages

    /**
     * Error message key for invalid gender values. Used when gender field contains unsupported
     * values.
     */
    public static final String GENDER_INVALID = "gender.invalid";

    /**
     * Error message key for invalid date of birth values. Used when date of birth field contains
     * invalid or future dates.
     */
    public static final String DATE_OF_BIRTH_INVALID = "dateOfBirth.invalid";

    // System Error Messages

    /**
     * Error message key for unexpected system errors. Used as fallback for unhandled exceptions and
     * system failures.
     */
    public static final String UNEXPECTED_ERROR = "error.unexpected";
}
