// File: backend/src/main/java/com/synchboard/backend/service/JwtService.java
package com.synchboard.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * Service for handling JSON Web Tokens (JWT).
 * Provides methods for generating, validating, and extracting information from
 * JWTs.
 */
@Service
public class JwtService {

    @Value(JWT_SECRETKEY_VALUE)
    private String secretKey;

    /**
     * Extracts the username (subject) from the JWT.
     *
     * @param token the JWT.
     * @return the username.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * A generic method to extract a specific claim from a JWT.
     *
     * @param token          the JWT.
     * @param claimsResolver a function to extract the desired claim.
     * @param <T>            the type of the claim.
     * @return the extracted claim.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Generates a new JWT for a given user.
     *
     * @param userDetails the user details for whom the token is generated.
     * @return the generated JWT.
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generates a new JWT with extra claims.
     *
     * @param extraClaims extra claims to include in the token.
     * @param userDetails the user details.
     * @return the generated JWT.
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                // Set expiration to 24 hours from now.
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validates a JWT.
     *
     * @param token       the JWT to validate.
     * @param userDetails the user details to validate against.
     * @return true if the token is valid, false otherwise.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Checks if a JWT is expired.
     *
     * @param token the JWT.
     * @return true if the token is expired, false otherwise.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extracts the expiration date from a JWT.
     *
     * @param token the JWT.
     * @return the expiration date.
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts all claims from a JWT.
     *
     * @param token the JWT.
     * @return the claims.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Gets the signing key for the JWT, derived from the base64 encoded secret key.
     *
     * @return the signing key.
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}