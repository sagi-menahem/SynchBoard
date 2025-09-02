package io.github.sagimenahem.synchboard.constants;

public final class MessageConstants {

    private MessageConstants() {}

    public static final String ERROR_EMAIL_CANT_BE_EMPTY = "Email cannot be empty";
    public static final String ERROR_EMAIL_SHOULD_BE_VALID = "Email should be valid";
    public static final String ERROR_PASSWORD_CANT_BE_EMPTY = "Password cannot be empty";
    public static final String BOARD_NAME_CANT_BE_EMPTY = "Board name cannot be empty.";
    public static final String BOARD_NAME_LENGTH =
            "Board name must be between 3 and 100 characters.";

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

    public static final String USER_NOT_FOUND = "User not found: ";
    public static final String BOARD_NOT_FOUND = "Board not found: ";
    public static final String EMAIL_IN_USE = "Email already in use: ";
    public static final String USER_ALREADY_MEMBER = "User is already a member of this board";
    public static final String CANNOT_INVITE_SELF = "cannotInviteSelf";
    public static final String AUTH_NOT_ADMIN = "You must be an admin to perform this action";
    public static final String AUTH_NOT_MEMBER = "You are not a member of this board";
    public static final String BOARD_CANNOT_REMOVE_SELF =
            "You cannot remove yourself from the board";
    public static final String USER_IS_ALREADY_ADMIN = "User is already an admin";
    public static final String PASSWORD_INCORRECT = "password.incorrect";
    public static final String UNEXPECTED_ERROR = "unexpected";
    public static final String PASSWORD_SAME_AS_OLD = "password.sameAsOld";
    public static final String AUTH_BAD_CREDENTIALS = "Incorrect username or password";
    public static final String GENDER_INVALID = "gender.invalid";
    public static final String DATE_OF_BIRTH_INVALID = "dateOfBirth.invalid";
}
