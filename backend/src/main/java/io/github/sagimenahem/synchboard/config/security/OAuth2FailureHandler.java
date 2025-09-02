package io.github.sagimenahem.synchboard.config.security;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException {

        log.error(SECURITY_PREFIX + " OAuth2 authentication failed: {}", exception.getMessage());

        String errorMessage = "Authentication failed. Please try again.";
        if (exception.getMessage() != null) {
            errorMessage = exception.getMessage();
        }

        String frontendUrl = "http://localhost:5173/auth/error?message="
                + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

        response.sendRedirect(frontendUrl);
    }
}
