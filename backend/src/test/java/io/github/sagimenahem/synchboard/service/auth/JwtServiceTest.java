package io.github.sagimenahem.synchboard.service.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.github.sagimenahem.synchboard.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Unit tests for {@link JwtService}. These run without a Spring context: the service only needs
 * {@link AppProperties} and its {@code @PostConstruct} hook invoked manually.
 *
 * <p>
 * The signing key is a throwaway test value. It is deliberately not read from configuration so the
 * suite never depends on a real secret.
 * </p>
 */
@DisplayName("JwtService")
class JwtServiceTest {

    /** 32 bytes, the minimum for HMAC-SHA256, base64 encoded as the service expects. */
    private static final String TEST_SECRET = Base64.getEncoder().encodeToString(
        "synchboard-unit-test-signing-key".getBytes(StandardCharsets.UTF_8)
    );

    private static final String OTHER_SECRET = Base64.getEncoder().encodeToString(
        "a-completely-different-hmac-key!!".getBytes(StandardCharsets.UTF_8)
    );

    private JwtService jwtService;
    private UserDetails user;

    private static JwtService serviceWith(String secret, int expirationHours) {
        AppProperties properties = new AppProperties();
        properties.getJwt().setSecretKey(secret);
        properties.getJwt().setExpirationHours(expirationHours);

        JwtService service = new JwtService(properties);
        service.init();
        return service;
    }

    @BeforeEach
    void setUp() {
        jwtService = serviceWith(TEST_SECRET, 24);
        user = User.withUsername("user@synchboard.com").password("irrelevant").authorities("ROLE_USER").build();
    }

    @Nested
    @DisplayName("token generation")
    class Generation {

        @Test
        @DisplayName("produces a three-part signed token")
        void producesSignedToken() {
            String token = jwtService.generateToken(user);

            assertThat(token).isNotBlank();
            assertThat(token.split("\\.")).hasSize(3);
        }

        @Test
        @DisplayName("puts the username in the subject claim")
        void subjectIsUsername() {
            String token = jwtService.generateToken(user);

            assertThat(jwtService.extractUsername(token)).isEqualTo("user@synchboard.com");
        }

        @Test
        @DisplayName("carries extra claims through into the payload")
        void carriesExtraClaims() {
            String token = jwtService.generateToken(Map.of("role", "ADMIN", "boardId", 42), user);

            // Bind to typed locals: inlining leaves T unresolved and collides with
            // AssertJ's assertThat(Predicate) overload.
            String role = jwtService.extractClaim(token, (claims) -> claims.get("role", String.class));
            Integer boardId = jwtService.extractClaim(token, (claims) -> claims.get("boardId", Integer.class));

            assertThat(role).isEqualTo("ADMIN");
            assertThat(boardId).isEqualTo(42);
        }

        @Test
        @DisplayName("honours the configured expiration window")
        void honoursConfiguredExpiry() {
            JwtService oneHour = serviceWith(TEST_SECRET, 1);

            Date issuedAt = oneHour.extractClaim(oneHour.generateToken(user), Claims::getIssuedAt);
            Date expiresAt = oneHour.extractClaim(oneHour.generateToken(user), Claims::getExpiration);

            long windowMillis = expiresAt.getTime() - issuedAt.getTime();
            // Allow a second of slack: the two tokens are minted microseconds apart.
            assertThat(windowMillis).isBetween(59L * 60 * 1000, 61L * 60 * 1000);
        }

        @Test
        @DisplayName("issues distinct expiry for a 24 hour configuration")
        void defaultWindowIsTwentyFourHours() {
            String token = jwtService.generateToken(user);

            Date expiresAt = jwtService.extractClaim(token, Claims::getExpiration);
            long millisFromNow = expiresAt.getTime() - System.currentTimeMillis();

            assertThat(millisFromNow).isGreaterThan(23L * 60 * 60 * 1000).isLessThanOrEqualTo(24L * 60 * 60 * 1000);
        }
    }

    @Nested
    @DisplayName("token validation")
    class Validation {

        @Test
        @DisplayName("accepts a freshly minted token for the same user")
        void acceptsOwnToken() {
            String token = jwtService.generateToken(user);

            assertThat(jwtService.isTokenValid(token, user)).isTrue();
        }

        @Test
        @DisplayName("rejects a token belonging to a different user")
        void rejectsTokenForAnotherUser() {
            String token = jwtService.generateToken(user);
            UserDetails someoneElse = User.withUsername("attacker@synchboard.com")
                .password("irrelevant")
                .authorities("ROLE_USER")
                .build();

            assertThat(jwtService.isTokenValid(token, someoneElse)).isFalse();
        }

        @Test
        @DisplayName("rejects a token signed with a different secret")
        void rejectsForeignSignature() {
            String foreignToken = serviceWith(OTHER_SECRET, 24).generateToken(user);

            assertThatThrownBy(() -> jwtService.isTokenValid(foreignToken, user)).isInstanceOf(JwtException.class);
        }

        @Test
        @DisplayName("rejects a token whose payload was tampered with")
        void rejectsTamperedPayload() {
            String token = jwtService.generateToken(user);
            String[] parts = token.split("\\.");
            String forgedPayload = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                    (
                        "{\"sub\":\"attacker@synchboard.com\",\"exp\":" +
                        (System.currentTimeMillis() / 1000 + 3600) +
                        "}"
                    ).getBytes(StandardCharsets.UTF_8)
                );
            String forged = parts[0] + "." + forgedPayload + "." + parts[2];

            assertThatThrownBy(() -> jwtService.extractUsername(forged)).isInstanceOf(JwtException.class);
        }

        @Test
        @DisplayName("rejects an expired token")
        void rejectsExpiredToken() {
            SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(TEST_SECRET));
            String expired = Jwts.builder()
                .subject("user@synchboard.com")
                .issuedAt(new Date(System.currentTimeMillis() - 7_200_000))
                .expiration(new Date(System.currentTimeMillis() - 3_600_000))
                .signWith(key)
                .compact();

            assertThatThrownBy(() -> jwtService.isTokenValid(expired, user)).isInstanceOf(JwtException.class);
        }

        @Test
        @DisplayName("rejects a token that is not a JWT at all")
        void rejectsGarbage() {
            assertThatThrownBy(() -> jwtService.extractUsername("not-a-jwt")).isInstanceOf(JwtException.class);
        }

        @Test
        @DisplayName("rejects an unsigned token — the alg:none forgery")
        void rejectsUnsignedToken() {
            String unsigned = Jwts.builder()
                .subject("user@synchboard.com")
                .expiration(new Date(System.currentTimeMillis() + 3_600_000))
                .compact();

            assertThatThrownBy(() -> jwtService.isTokenValid(unsigned, user)).isInstanceOf(JwtException.class);
        }
    }
}
