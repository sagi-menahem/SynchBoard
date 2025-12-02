package io.github.sagimenahem.synchboard.constants;

/**
 * Security configuration constants defining authentication, authorization, and token management
 * settings for the SynchBoard application. These constants control JWT token handling, CORS
 * policies, user roles, and various security timeouts throughout the application security
 * infrastructure.
 *
 * @author Sagi Menahem
 */
public final class SecurityConstants {

    private SecurityConstants() {}

    // CORS and Client Configuration

    /**
     * Default client origin URL for CORS configuration. Allows frontend development server to
     * communicate with the backend. Should be overridden via environment variables in production.
     */
    public static final String CLIENT_ORIGIN_URL = "http://localhost:5173";

    // User Roles and Authorization

    /**
     * Standard user role granted to authenticated users. Used by Spring Security for role-based
     * access control throughout the application.
     */
    public static final String ROLE_USER = "ROLE_USER";

    /**
     * HTTP header name for authorization tokens. Standard header used for Bearer token
     * authentication.
     */
    public static final String AUTHORIZATION = "Authorization";

    // JWT Token Configuration

    /**
     * Bearer token prefix used in authorization headers. Must include the trailing space for proper
     * token parsing.
     */
    public static final String JWT_PREFIX = "Bearer ";

    /**
     * Length of the JWT Bearer prefix in characters. Used for token extraction from authorization
     * headers.
     */
    public static final int JWT_PREFIX_LENGTH = 7;

    /**
     * Property placeholder for JWT secret key configuration. Resolved from application properties
     * or environment variables at runtime.
     */
    public static final String JWT_SECRETKEY_VALUE = "${application.security.jwt.secret-key}";

    /**
     * Default JWT token expiration time in milliseconds. Set to 24 hours (1000ms * 60s * 60m * 24h)
     * for balanced security and usability.
     */
    public static final long JWT_EXPIRATION_MS = 1000 * 60 * 60 * 24;

    // Email and Password Security Timeouts

    /**
     * Email verification token expiration time in minutes. Provides reasonable time for users to
     * verify their email while maintaining security.
     */
    public static final int EMAIL_VERIFICATION_TIMEOUT_MINUTES = 15;

    /**
     * Password reset token expiration time in minutes. Allows sufficient time for password reset
     * while preventing token abuse.
     */
    public static final int PASSWORD_RESET_TIMEOUT_MINUTES = 60;
}
