package io.github.sagimenahem.synchboard.config.constants;

public final class SecurityConstants {

    private SecurityConstants() {}

    public static final String CLIENT_ORIGIN_URL = "http://localhost:5173";
    public static final String ROLE_USER = "ROLE_USER";
    public static final String AUTHORIZATION = "Authorization";

    public static final String JWT_PREFIX = "Bearer ";
    public static final int JWT_PREFIX_LENGTH = 7;
    public static final String JWT_SECRETKEY_VALUE = "${application.security.jwt.secret-key}";
    public static final long JWT_EXPIRATION_MS = 1000 * 60 * 60 * 24; // 24 hours
}
