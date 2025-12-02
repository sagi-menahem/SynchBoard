package io.github.sagimenahem.synchboard.service.auth;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;

import io.github.sagimenahem.synchboard.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/**
 * Service for JWT token operations including generation, validation, and parsing. Handles all
 * JWT-related functionality for user authentication and authorization. Uses HMAC SHA algorithms for
 * token signing and verification.
 *
 * @author Sagi Menahem
 */
@Slf4j
@Service
public class JwtService {

    /**
     * Application properties containing JWT configuration
     */
    private final AppProperties appProperties;

    /**
     * The signing key used for JWT token creation and verification
     */
    private Key signInKey;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    /**
     * Initializes the JWT service by setting up the signing key. This method is called after
     * dependency injection is complete.
     */
    @PostConstruct
    public void init() {
        log.info(SECURITY_PREFIX + " Initializing JWT service with configured secret key");
        byte[] keyBytes = Decoders.BASE64.decode(appProperties.getJwt().getSecretKey());
        this.signInKey = Keys.hmacShaKeyFor(keyBytes);
        log.debug(SECURITY_PREFIX + " JWT service initialized successfully");
    }

    /**
     * Extracts the username (subject) from a JWT token.
     *
     * @param token the JWT token
     * @return the username stored in the token's subject claim
     */
    public String extractUsername(String token) {
        log.debug(SECURITY_PREFIX + " Extracting username from JWT token");
        String username = extractClaim(token, Claims::getSubject);
        log.debug(SECURITY_PREFIX + " Extracted username: {}", username);
        return username;
    }

    /**
     * Extracts a specific claim from a JWT token using a claims resolver function.
     *
     * @param <T> the type of the claim value
     * @param token the JWT token
     * @param claimsResolver function to extract the desired claim
     * @return the extracted claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Generates a JWT token for the given user without additional claims.
     *
     * @param userDetails the user details containing username and authorities
     * @return a signed JWT token
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generates a JWT token for the given user with additional custom claims.
     *
     * @param extraClaims additional claims to include in the token
     * @param userDetails the user details containing username and authorities
     * @return a signed JWT token with the specified claims
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        String username = userDetails.getUsername();
        log.debug(SECURITY_PREFIX + " Generating JWT token for user: {}", username);

        String token = Jwts.builder()
            .claims(extraClaims)
            .subject(username)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + getExpirationTimeInMillis()))
            .signWith(getSignInKey())
            .compact();

        log.info(SECURITY_PREFIX + " JWT token generated for user: {}", username);
        return token;
    }

    /**
     * Calculates the token expiration time in milliseconds.
     *
     * @return expiration time in milliseconds from now
     */
    private long getExpirationTimeInMillis() {
        return appProperties.getJwt().getExpirationHours() * 60L * 60L * 1000L;
    }

    /**
     * Validates a JWT token against the provided user details. Checks both username match and token
     * expiration.
     *
     * @param token the JWT token to validate
     * @param userDetails the user details to validate against
     * @return true if the token is valid, false otherwise
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        boolean isValid = (username.equals(userDetails.getUsername())) && !isTokenExpired(token);

        if (isValid) {
            log.debug(SECURITY_PREFIX + " JWT token validated for user: {}", username);
        } else {
            log.warn(
                SECURITY_PREFIX + " Invalid JWT token for user: {}. Reason: {}",
                username,
                !username.equals(userDetails.getUsername()) ? "username mismatch" : "token expired"
            );
        }

        return isValid;
    }

    /**
     * Checks if a JWT token has expired.
     *
     * @param token the JWT token to check
     * @return true if the token has expired, false otherwise
     */
    private boolean isTokenExpired(String token) {
        boolean expired = extractExpiration(token).before(new Date());
        if (expired) {
            log.debug(SECURITY_PREFIX + " Token is expired");
        }
        return expired;
    }

    /**
     * Extracts the expiration date from a JWT token.
     *
     * @param token the JWT token
     * @return the expiration date
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts all claims from a JWT token.
     *
     * @param token the JWT token
     * @return all claims from the token
     * @throws io.jsonwebtoken.JwtException if the token is invalid or expired
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        } catch (Exception e) {
            log.error(SECURITY_PREFIX + " Failed to extract claims from token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Gets the signing key used for JWT operations.
     *
     * @return the signing key
     */
    private Key getSignInKey() {
        return signInKey;
    }
}
