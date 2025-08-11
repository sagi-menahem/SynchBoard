package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;
import static io.github.sagimenahem.synchboard.constants.SecurityConstants.JWT_EXPIRATION_MS;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.github.sagimenahem.synchboard.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class JwtService {

    private final AppProperties appProperties;
    private Key signInKey;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @PostConstruct
    public void init() {
        log.info(SECURITY_PREFIX + " Initializing JWT service with configured secret key");
        byte[] keyBytes = Decoders.BASE64.decode(appProperties.getJwt().getSecretKey());
        this.signInKey = Keys.hmacShaKeyFor(keyBytes);
        log.debug(SECURITY_PREFIX + " JWT service initialized successfully");
    }

    public String extractUsername(String token) {
        log.debug(SECURITY_PREFIX + " Extracting username from JWT token");
        String username = extractClaim(token, Claims::getSubject);
        log.debug(SECURITY_PREFIX + " Extracted username: {}", username);
        return username;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        String username = userDetails.getUsername();
        log.debug(SECURITY_PREFIX + " Generating JWT token for user: {}", username);

        String token = Jwts.builder().setClaims(extraClaims).setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256).compact();

        log.info(SECURITY_PREFIX + " JWT token generated for user: {}", username);
        return token;
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        boolean isValid = (username.equals(userDetails.getUsername())) && !isTokenExpired(token);

        if (isValid) {
            log.debug(SECURITY_PREFIX + " JWT token validated for user: {}", username);
        } else {
            log.warn(SECURITY_PREFIX + " Invalid JWT token for user: {}. Reason: {}", username,
                    !username.equals(userDetails.getUsername()) ? "username mismatch"
                            : "token expired");
        }

        return isValid;
    }

    private boolean isTokenExpired(String token) {
        boolean expired = extractExpiration(token).before(new Date());
        if (expired) {
            log.debug(SECURITY_PREFIX + " Token is expired");
        }
        return expired;
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error(SECURITY_PREFIX + " Failed to extract claims from token: {}", e.getMessage());
            throw e;
        }
    }

    private Key getSignInKey() {
        return signInKey;
    }
}
