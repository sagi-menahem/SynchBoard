// File: backend/src/main/java/com/synchboard/backend/config/ApplicationConstants.java
package com.synchboard.backend.config;

public final class ApplicationConstants {

    private ApplicationConstants() {
    }

    // Security & CORS Constants
    public static final String CLIENT_ORIGIN_URL = "http://localhost:5173";
    public static final String ROLE_USER = "ROLE_USER";
    public static final String AUTHORIZATION = "Authorization";

    // API Path Constants
    public static final String API_AUTH_PATH = "/api/auth/**";
    public static final String API_AUTH_REGISTER_PATH = "/register";
    public static final String API_AUTH_LOGIN_PATH = "/login";
    public static final String API_AUTH_TEST_PATH = "/test";
    public static final String API_BOARDS_PATH = "/api/boards";
    public static final String API_BOARDS_WITH_SUBPATHS = "/api/boards/**";
    public static final String API_BOARDS_OBJECT = "/{boardId}/objects";

    // JWT (JSON Web Token) Constants
    public static final String JWT_PREFIX = "Bearer ";
    public static final int JWT_PREFIX_LENGTH = 7;
    public static final String JWT_SECRETKEY_VALUE = "${application.security.jwt.secret-key}";
    public static final long JWT_EXPIRATION_MS = 1000 * 60 * 60 * 24; // 24 hours

    // WebSocket Constants
    public static final String WEBSOCKET_ENDPOINT = "/ws";
    public static final String WEBSOCKET_ENDPOINT_WITH_SUBPATHS = "/ws/**";
    public static final String WEBSOCKET_APP_PREFIX = "/app";
    public static final String WEBSOCKET_TOPIC_PREFIX = "/topic";
    public static final String WEBSOCKET_BOARD_TOPIC_PREFIX = "/topic/board/";

    // WebSocket Message Mappings
    public static final String MAPPING_CHAT_SEND_MESSAGE = "/chat.sendMessage";
    public static final String MAPPING_BOARD_DRAW_ACTION = "/board.drawAction";

    // WebSocket Transport Settings
    public static final int WEBSOCKET_MESSAGE_SIZE_LIMIT = 512 * 1024;
    public static final int WEBSOCKET_SEND_BUFFER_SIZE_LIMIT = 512 * 1024;

    // General String Constants
    public static final String AUTH_TEST_ENDPOINT_SUCCESS_MESSAGE = "Hello, authenticated user!";

    // Error Messages
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
}