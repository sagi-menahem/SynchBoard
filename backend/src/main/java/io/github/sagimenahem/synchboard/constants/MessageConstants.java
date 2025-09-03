package io.github.sagimenahem.synchboard.constants;

public final class MessageConstants {

    private MessageConstants() {}

    public static final String ERROR_EMAIL_CANT_BE_EMPTY = "error.email.cannotBeEmpty";
    public static final String ERROR_EMAIL_SHOULD_BE_VALID = "error.email.shouldBeValid";
    public static final String ERROR_PASSWORD_CANT_BE_EMPTY = "error.password.cannotBeEmpty";
    public static final String BOARD_NAME_CANT_BE_EMPTY = "error.board.nameCannotBeEmpty";
    public static final String BOARD_NAME_LENGTH = "error.board.nameLength";

    public static final int BOARD_NAME_MIN_LENGTH = 3;
    public static final int BOARD_NAME_MAX_LENGTH = 100;
    public static final int CANVAS_WIDTH_MIN = 400;
    public static final int CANVAS_WIDTH_MAX = 4000;
    public static final int CANVAS_HEIGHT_MIN = 300;
    public static final int CANVAS_HEIGHT_MAX = 4000;
    public static final int CANVAS_CHAT_SPLIT_RATIO_MIN = 30;
    public static final int CANVAS_CHAT_SPLIT_RATIO_MAX = 70;
    public static final int DEFAULT_STROKE_WIDTH_MIN = 1;
    public static final int DEFAULT_STROKE_WIDTH_MAX = 50;

    public static final String USER_NOT_FOUND = "error.user.notFound";
    public static final String BOARD_NOT_FOUND = "error.board.notFound";
    public static final String EMAIL_IN_USE = "error.email.inUse";
    public static final String USER_ALREADY_MEMBER = "error.user.alreadyMember";
    public static final String CANNOT_INVITE_SELF = "error.user.cannotInviteSelf";
    public static final String AUTH_NOT_ADMIN = "error.auth.notAdmin";
    public static final String AUTH_NOT_MEMBER = "error.auth.notMember";
    public static final String BOARD_CANNOT_REMOVE_SELF = "error.board.cannotRemoveSelf";
    public static final String USER_IS_ALREADY_ADMIN = "error.user.alreadyAdmin";
    public static final String PASSWORD_INCORRECT = "password.incorrect";
    public static final String UNEXPECTED_ERROR = "error.unexpected";
    public static final String PASSWORD_SAME_AS_OLD = "password.sameAsOld";
    public static final String AUTH_BAD_CREDENTIALS = "auth.badCredentials";
    public static final String AUTH_FAILED_TRY_AGAIN = "auth.failedTryAgain";
    public static final String AUTH_EMAIL_ALREADY_REGISTERED = "auth.emailAlreadyRegistered";
    public static final String GENDER_INVALID = "gender.invalid";
    public static final String DATE_OF_BIRTH_INVALID = "dateOfBirth.invalid";
}
