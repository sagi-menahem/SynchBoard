// File: backend/src/main/java/com/synchboard/backend/config/constants/MessageConstants.java
package com.synchboard.backend.config.constants;

import java.util.Arrays;
import java.util.List;

public final class MessageConstants {

    private MessageConstants() {
    }

    public static final List<String> ALLOWED_FONT_SIZES = Arrays.asList("small", "medium", "large");

    public static final String ERROR_EMAIL_CANT_BE_EMPTY = "Email cannot be empty";
    public static final String ERROR_EMAIL_SHOULD_BE_VALID = "Email should be valid";
    public static final String ERROR_PASSWORD_CANT_BE_EMPTY = "Password cannot be empty";
    public static final String ERROR_USER_NOT_FOUND_TEMPLATE = "User not found with email: ";
    public static final String BOARD_NAME_CANT_BE_EMPTY = "Board name cannot be empty.";
    public static final String BOARD_NAME_LENGHT = "Board name must be between 3 and 100 characters.";
    public static final String USER_NOT_FOUND = "User not found: ";
    public static final String BOARD_NOT_FOUND = "Board not found: ";
    public static final String ERROR_EMAIL_IN_USE = "Error: Email is already in use!";
    public static final String ERROR_USER_NOT_FOUND_AFTER_AUTH = "User not found after authentication";
    public static final String ERROR_USER_ALREADY_MEMBER = "User is already a member of this board";
    public static final String ERROR_ACCESS_DENIED_NOT_A_MEMBER = "Inviting user is not a member of the board.";
    public static final String ERROR_ACCESS_DENIED_NOT_AN_ADMIN = "User does not have admin privileges for this board.";
    public static final String ERROR_ACCESS_DENIED_NOT_A_MEMBER_OF_BOARD = "User is not a member of this board.";
    public static final String ERROR_CANNOT_REMOVE_SELF = "You cannot remove yourself from the board via this action.";
    public static final String ERROR_USER_IS_ALREADY_ADMIN = "User is already an admin of this board.";
    public static final String ERROR_INCORRECT_CURRENT_PASSWORD = "The current password provided is incorrect.";
    public static final String ERROR_UNEXPECTED = "An unexpected error occurred. Please try again later.";
    public static final String ERROR_PASSWORD_SAME_AS_OLD = "New password cannot be the same as the old password.";
    public static final String ERROR_INVALID_FONT_SIZE = "Invalid font size setting provided.";
}