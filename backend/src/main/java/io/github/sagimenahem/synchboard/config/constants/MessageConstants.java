package io.github.sagimenahem.synchboard.config.constants;

import java.util.Arrays;
import java.util.List;

public final class MessageConstants {

    private MessageConstants() {}

    public static final List<String> ALLOWED_FONT_SIZES = Arrays.asList("small", "medium", "large");

    public static final String ERROR_EMAIL_CANT_BE_EMPTY = "Email cannot be empty";
    public static final String ERROR_EMAIL_SHOULD_BE_VALID = "Email should be valid";
    public static final String ERROR_PASSWORD_CANT_BE_EMPTY = "Password cannot be empty";
    public static final String BOARD_NAME_CANT_BE_EMPTY = "Board name cannot be empty.";
    public static final String BOARD_NAME_LENGHT =
            "Board name must be between 3 and 100 characters.";

    public static final String USER_NOT_FOUND = "user.notFound";
    public static final String BOARD_NOT_FOUND = "board.notFound";
    public static final String EMAIL_IN_USE = "email.inUse";
    public static final String USER_ALREADY_MEMBER = "user.alreadyMember";
    public static final String AUTH_NOT_ADMIN = "auth.notAdmin";
    public static final String AUTH_NOT_MEMBER = "auth.notMember";
    public static final String BOARD_CANNOT_REMOVE_SELF = "board.cannotRemoveSelf";
    public static final String USER_IS_ALREADY_ADMIN = "user.alreadyAdmin";
    public static final String PASSWORD_INCORRECT = "password.incorrect";
    public static final String UNEXPECTED_ERROR = "unexpected";
    public static final String PASSWORD_SAME_AS_OLD = "password.sameAsOld";
    public static final String FONT_SIZE_INVALID = "fontSize.invalid";
    public static final String AUTH_BAD_CREDENTIALS = "auth.badCredentials";
}
