// File: backend/src/main/java/com/synchboard/backend/config/constants/ApiConstants.java
package com.synchboard.backend.config.constants;

public final class ApiConstants {

    private ApiConstants() {
    }

    public static final String API_AUTH_PATH = "/api/auth/**";
    public static final String API_AUTH_REGISTER_PATH = "/register";
    public static final String API_AUTH_LOGIN_PATH = "/login";
    public static final String API_AUTH_TEST_PATH = "/test";
    public static final String API_BOARDS_PATH = "/api/boards";
    public static final String API_BOARDS_WITH_SUBPATHS = "/api/boards/**";
    public static final String API_BOARDS_OBJECT = "/{boardId}/objects";
    public static final String API_USER_PATH = "/api/user/**";

    public static final String AUTH_TEST_ENDPOINT_SUCCESS_MESSAGE = "Hello, authenticated user!";
}