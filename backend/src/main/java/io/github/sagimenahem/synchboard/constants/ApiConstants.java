package io.github.sagimenahem.synchboard.constants;

/**
 * API constants defining REST endpoint paths, URL patterns, and request parameters. Centralizes all
 * API-related string constants to maintain consistency and facilitate refactoring across
 * controllers and configuration classes.
 *
 * @author Sagi Menahem
 */
public final class ApiConstants {

    private ApiConstants() {}

    public static final String APPLICATION_VERSION = "1.0.0";

    public static final String API_AUTH_BASE_PATH = "/api/auth";
    public static final String API_BOARDS_BASE_PATH = "/api/boards";
    public static final String API_USER_BASE_PATH = "/api/user";

    public static final String API_AUTH_REGISTER_PATH = "/register";
    public static final String API_AUTH_LOGIN_PATH = "/login";
    public static final String API_AUTH_GOOGLE_ONE_TAP_PATH = "/google-one-tap";

    public static final String API_AUTH_PATH_PATTERN = "/api/auth/**";
    public static final String API_BOARDS_PATH_PATTERN = "/api/boards/**";
    public static final String API_USER_PATH_PATTERN = "/api/user/**";
    public static final String IMAGES_PATH_PATTERN = "/images/**";

    public static final String API_BOARDS_OBJECT = "/{boardId}/objects";
    public static final String API_BOARDS_DETAILS = "/{boardId}/details";
    public static final String API_BOARDS_MEMBERS = "/{boardId}/members";
    public static final String API_BOARDS_MEMBERS_REMOVE = "/{boardId}/members/{memberEmail}";
    public static final String API_BOARDS_MEMBERS_LEAVE = "/{boardId}/members/leave";
    public static final String API_BOARDS_MEMBERS_PROMOTE = "/{boardId}/members/{memberEmail}/promote";
    public static final String API_BOARDS_UNDO = "/{boardId}/undo";
    public static final String API_BOARDS_REDO = "/{boardId}/redo";
    public static final String API_BOARDS_NAME = "/{boardId}/name";
    public static final String API_BOARDS_DESCRIPTION = "/{boardId}/description";
    public static final String API_BOARDS_PICTURE = "/{boardId}/picture";
    public static final String API_BOARDS_MESSAGES = "/{boardId}/messages";
    public static final String API_BOARDS_CANVAS_SETTINGS = "/{boardId}/canvas-settings";

    public static final String PATH_VAR_BOARD_ID = "boardId";
    public static final String PATH_VAR_MEMBER_EMAIL = "memberEmail";

    public static final String REQUEST_PARAM_FILE = "file";

    public static final String PARAM_USER_EMAIL = "userEmail";

    public static final String API_USER_PROFILE = "/profile";
    public static final String API_USER_PASSWORD = "/password";
    public static final String API_USER_PROFILE_PICTURE = "/profile-picture";
    public static final String API_USER_ACCOUNT = "/account";
    public static final String API_USER_PREFERENCES = "/preferences";
    public static final String API_USER_CANVAS_PREFERENCES = "/canvas-preferences";
    public static final String API_USER_TOOL_PREFERENCES = "/tool-preferences";
    public static final String API_USER_LANGUAGE_PREFERENCES = "/language-preferences";
    public static final String API_USER_THEME_PREFERENCES = "/theme-preferences";
    public static final String API_USER_EXISTS = "/exists/{email}";
}
