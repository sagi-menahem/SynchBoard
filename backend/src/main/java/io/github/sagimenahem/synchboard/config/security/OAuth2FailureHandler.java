package io.github.sagimenahem.synchboard.config.security;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;

import io.github.sagimenahem.synchboard.config.AppProperties;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

/**
 * OAuth2 authentication failure handler for processing failed OAuth2 login attempts. Redirects
 * users to the frontend error page with appropriate error messages when OAuth2 authentication
 * fails.
 * 
 * @author Sagi Menahem
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    /** Application configuration properties */
    private final AppProperties appProperties;

    /**
     * Handles OAuth2 authentication failures by logging the error and redirecting to the frontend
     * error page with the failure message.
     * 
     * @param request The HTTP servlet request
     * @param response The HTTP servlet response
     * @param exception The authentication exception that caused the failure
     * @throws IOException if redirect fails
     */
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException {
        log.error(SECURITY_PREFIX + " OAuth2 authentication failed: {}", exception.getMessage());

        String errorMessage = MessageConstants.AUTH_FAILED_TRY_AGAIN;
        if (exception.getMessage() != null) {
            errorMessage = exception.getMessage();
        }

        String frontendUrl = appProperties.getOauth2().getFrontendBaseUrl() + "/auth/error?message="
                + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

        response.sendRedirect(frontendUrl);
    }
}
