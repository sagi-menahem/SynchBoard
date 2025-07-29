// File: backend/src/main/java/com/synchboard/backend/config/constants/ApiConstants.java
package com.synchboard.backend.config.constants;

public final class ApiConstants {

    private ApiConstants() {}

    // Base API paths
    public static final String API_AUTH_BASE_PATH = "/api/auth";
    public static final String API_BOARDS_BASE_PATH = "/api/boards";
    public static final String API_USER_BASE_PATH = "/api/user";

    // Auth endpoints (relative paths)
    public static final String API_AUTH_REGISTER_PATH = "/register";
    public static final String API_AUTH_LOGIN_PATH = "/login";
    public static final String API_AUTH_TEST_PATH = "/test";

    // Security patterns (for Spring Security configuration)
    public static final String API_AUTH_PATH_PATTERN = "/api/auth/**";
    public static final String API_BOARDS_PATH_PATTERN = "/api/boards/**";
    public static final String API_USER_PATH_PATTERN = "/api/user/**";
    public static final String IMAGES_PATH_PATTERN = "/images/**";

    // Board specific endpoints
    public static final String API_BOARDS_OBJECT = "/{boardId}/objects";
    public static final String API_BOARDS_DETAILS = "/{boardId}/details";
    public static final String API_BOARDS_MEMBERS = "/{boardId}/members";
    public static final String API_BOARDS_MEMBERS_REMOVE = "/{boardId}/members/{memberEmail}";
    public static final String API_BOARDS_MEMBERS_LEAVE = "/{boardId}/members/leave";
    public static final String API_BOARDS_MEMBERS_PROMOTE =
            "/{boardId}/members/{memberEmail}/promote";
    public static final String API_BOARDS_UNDO = "/{boardId}/undo";
    public static final String API_BOARDS_REDO = "/{boardId}/redo";
    public static final String API_BOARDS_NAME = "/{boardId}/name";
    public static final String API_BOARDS_DESCRIPTION = "/{boardId}/description";
    public static final String API_BOARDS_PICTURE = "/{boardId}/picture";
    public static final String API_BOARDS_MESSAGES = "/{boardId}/messages";

    // Path variable names
    public static final String PATH_VAR_BOARD_ID = "boardId";
    public static final String PATH_VAR_MEMBER_EMAIL = "memberEmail";

    // Request parameter names
    public static final String REQUEST_PARAM_FILE = "file";

    // User specific endpoints
    public static final String API_USER_PROFILE = "/profile";
    public static final String API_USER_PASSWORD = "/password";
    public static final String API_USER_PROFILE_PICTURE = "/profile-picture";
    public static final String API_USER_ACCOUNT = "/account";
    public static final String API_USER_PREFERENCES = "/preferences";

    // Messages
    public static final String AUTH_TEST_ENDPOINT_SUCCESS_MESSAGE = "Hello, authenticated user!";
}
