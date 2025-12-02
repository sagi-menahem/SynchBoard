package io.github.sagimenahem.synchboard.config.security;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;

import io.github.sagimenahem.synchboard.config.AppProperties;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.auth.GoogleUserInfo;
import io.github.sagimenahem.synchboard.service.auth.GoogleAuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

/**
 * OAuth2 authentication success handler for processing Google OAuth2 login via redirect flow.
 * Extracts user information from the OAuth2 token and delegates to GoogleAuthService for user
 * processing and JWT generation. Handles frontend redirection after successful authentication.
 *
 * @author Sagi Menahem
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    /** Service for processing Google authentication */
    private final GoogleAuthService googleAuthService;
    /** Application configuration properties */
    private final AppProperties appProperties;

    /**
     * Handles successful OAuth2 authentication by extracting user data, processing authentication,
     * and redirecting to the frontend with a JWT token.
     *
     * @param request The HTTP servlet request
     * @param response The HTTP servlet response
     * @param authentication The OAuth2 authentication object
     * @throws IOException if I/O operations fail
     * @throws ServletException if servlet operations fail
     */
    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String registrationId = oauthToken.getAuthorizedClientRegistrationId();

        log.info(SECURITY_PREFIX + " OAuth2 authentication success for provider: {}", registrationId);

        try {
            // Extract user info from OAuth2 token
            GoogleUserInfo googleUserInfo = GoogleUserInfo.builder()
                .email(oAuth2User.getAttribute("email"))
                .providerId(oAuth2User.getAttribute("sub"))
                .name(oAuth2User.getAttribute("name"))
                .pictureUrl(oAuth2User.getAttribute("picture"))
                .build();

            // Delegate to shared service for user processing
            String jwt = googleAuthService.processGoogleUser(googleUserInfo);

            String frontendUrl =
                appProperties.getOauth2().getFrontendBaseUrl() +
                "/auth/callback?token=" +
                URLEncoder.encode(jwt, StandardCharsets.UTF_8);

            log.info(SECURITY_PREFIX + " OAuth2 authentication successful for: {}", googleUserInfo.getEmail());
            response.sendRedirect(frontendUrl);
        } catch (Exception e) {
            log.error(SECURITY_PREFIX + " Error processing OAuth2 authentication", e);
            handleAuthenticationFailure(response, MessageConstants.AUTH_FAILED_TRY_AGAIN);
        }
    }

    /**
     * Handles OAuth2 authentication failures by redirecting to frontend error page.
     *
     * @param response The HTTP servlet response
     * @param message The error message to display to user
     * @throws IOException if redirect fails
     */
    private void handleAuthenticationFailure(HttpServletResponse response, String message) throws IOException {
        String frontendUrl =
            appProperties.getOauth2().getFrontendBaseUrl() +
            "/auth/error?message=" +
            URLEncoder.encode(message, StandardCharsets.UTF_8);
        response.sendRedirect(frontendUrl);
    }
}
