package io.github.sagimenahem.synchboard.config.security;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import io.github.sagimenahem.synchboard.config.AppProperties;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final AppProperties appProperties;

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
