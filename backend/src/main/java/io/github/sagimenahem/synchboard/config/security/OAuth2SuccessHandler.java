package io.github.sagimenahem.synchboard.config.security;

import static io.github.sagimenahem.synchboard.constants.FileConstants.IMAGES_BASE_PATH;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import io.github.sagimenahem.synchboard.config.AppProperties;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import io.github.sagimenahem.synchboard.service.auth.JwtService;
import io.github.sagimenahem.synchboard.service.storage.FileStorageService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

        private final UserRepository userRepository;
        private final JwtService jwtService;
        private final FileStorageService fileStorageService;
        private final AppProperties appProperties;

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request,
                        HttpServletResponse response, Authentication authentication)
                        throws IOException, ServletException {

                OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                OAuth2User oAuth2User = oauthToken.getPrincipal();
                String registrationId = oauthToken.getAuthorizedClientRegistrationId();

                log.info(SECURITY_PREFIX + " OAuth2 authentication success for provider: {}",
                                registrationId);

                try {
                        String email = oAuth2User.getAttribute("email");
                        String providerId = oAuth2User.getAttribute("sub");
                        String name = oAuth2User.getAttribute("name");
                        String pictureUrl = oAuth2User.getAttribute("picture");

                        if (email == null || providerId == null) {
                                log.error(SECURITY_PREFIX
                                                + " Missing required OAuth2 user data - email: {}, providerId: {}",
                                                email != null, providerId != null);
                                handleAuthenticationFailure(response,
                                                "Missing required user information from Google");
                                return;
                        }

                        Optional<User> existingUser;
                        try {
                                existingUser = userRepository.findById(email);
                                log.info(SECURITY_PREFIX
                                                + " OAuth2 user lookup result for {}: exists={}",
                                                email, existingUser.isPresent());
                        } catch (Exception dbException) {
                                log.error(SECURITY_PREFIX
                                                + " Database error during OAuth2 user lookup for {}: {}",
                                                email, dbException.getMessage());
                                handleAuthenticationFailure(response,
                                                "Database is not available. Please try again later.");
                                return;
                        }

                        User userForToken;

                        if (existingUser.isPresent()) {
                                User user = existingUser.get();
                                log.info(SECURITY_PREFIX
                                                + " Found existing user: email={}, authProvider={}, creationDate={}",
                                                email, user.getAuthProvider(),
                                                user.getCreationDate());

                                if (user.getAuthProvider() != User.AuthProvider.GOOGLE) {
                                        log.warn(SECURITY_PREFIX
                                                        + " OAuth2 login attempted for existing non-OAuth user: {}",
                                                        email);
                                        handleAuthenticationFailure(response,
                                                        MessageConstants.AUTH_EMAIL_ALREADY_REGISTERED);
                                        return;
                                }

                                log.info(SECURITY_PREFIX
                                                + " Updating existing OAuth2 user data for: {}",
                                                email);
                                updateUserFromOAuth2(user, name, pictureUrl, providerId);
                                try {
                                        userForToken = userRepository.save(user);
                                        log.info(SECURITY_PREFIX
                                                        + " Updated existing OAuth2 user: {}",
                                                        email);
                                } catch (Exception dbException) {
                                        log.error(SECURITY_PREFIX
                                                        + " Database error during OAuth2 user update for {}: {}",
                                                        email, dbException.getMessage());
                                        handleAuthenticationFailure(response,
                                                        "Database is not available. Please try again later.");
                                        return;
                                }
                        } else {
                                log.info(SECURITY_PREFIX + " Creating new OAuth2 user for: {}",
                                                email);
                                User newUser = createUserFromOAuth2(email, name, pictureUrl,
                                                providerId);
                                try {
                                        userForToken = userRepository.save(newUser);
                                        log.info(SECURITY_PREFIX
                                                        + " Created new OAuth2 user: {} with creation date: {}",
                                                        email, newUser.getCreationDate());
                                } catch (Exception dbException) {
                                        log.error(SECURITY_PREFIX
                                                        + " Database error during OAuth2 user creation for {}: {}",
                                                        email, dbException.getMessage());
                                        handleAuthenticationFailure(response,
                                                        "Database is not available. Please try again later.");
                                        return;
                                }
                        }

                        String jwt = jwtService.generateToken(userForToken);

                        String frontendUrl = appProperties.getOauth2().getFrontendBaseUrl()
                                        + "/auth/callback?token="
                                        + URLEncoder.encode(jwt, StandardCharsets.UTF_8);

                        log.info(SECURITY_PREFIX + " OAuth2 authentication successful for: {}",
                                        email);
                        response.sendRedirect(frontendUrl);

                } catch (Exception e) {
                        log.error(SECURITY_PREFIX + " Error processing OAuth2 authentication", e);
                        handleAuthenticationFailure(response,
                                        MessageConstants.AUTH_FAILED_TRY_AGAIN);
                }
        }

        private void handleAuthenticationFailure(HttpServletResponse response, String message)
                        throws IOException {
                String frontendUrl = appProperties.getOauth2().getFrontendBaseUrl()
                                + "/auth/error?message="
                                + URLEncoder.encode(message, StandardCharsets.UTF_8);
                response.sendRedirect(frontendUrl);
        }

        private User createUserFromOAuth2(String email, String name, String pictureUrl,
                        String providerId) {
                String[] nameParts = splitName(name);

                String localPicturePath = null;
                if (pictureUrl != null) {
                        localPicturePath =
                                        fileStorageService.downloadAndStoreImageFromUrl(pictureUrl);
                        if (localPicturePath != null) {
                                log.info(SECURITY_PREFIX
                                                + " Downloaded and stored profile picture for new user: {}",
                                                email);
                        } else {
                                log.warn(SECURITY_PREFIX
                                                + " Failed to download profile picture from URL: {}",
                                                pictureUrl);
                        }
                }

                return User.builder().email(email).firstName(nameParts[0]).lastName(nameParts[1])
                                .authProvider(User.AuthProvider.GOOGLE).providerId(providerId)
                                .profilePictureUrl(localPicturePath)
                                .creationDate(LocalDateTime.now()).build();
        }

        private void updateUserFromOAuth2(User user, String name, String pictureUrl,
                        String providerId) {
                if (name != null) {
                        String[] nameParts = splitName(name);
                        user.setFirstName(nameParts[0]);
                        user.setLastName(nameParts[1]);
                }

                if (pictureUrl != null) {
                        if (StringUtils.hasText(user.getProfilePictureUrl())) {
                                String existingFilename = user.getProfilePictureUrl()
                                                .substring(IMAGES_BASE_PATH.length());
                                if (existingFilename != null && !existingFilename.isBlank()) {
                                        log.debug(SECURITY_PREFIX
                                                        + " Deleting existing OAuth profile picture: {}",
                                                        existingFilename);
                                        try {
                                                fileStorageService.delete(existingFilename);
                                                log.debug(SECURITY_PREFIX
                                                                + " Successfully deleted existing OAuth profile picture: {}",
                                                                existingFilename);
                                        } catch (Exception e) {
                                                log.warn(SECURITY_PREFIX
                                                                + " Failed to delete existing OAuth profile picture: {} - {}",
                                                                existingFilename, e.getMessage());
                                        }
                                }
                        }

                        String localPicturePath =
                                        fileStorageService.downloadAndStoreImageFromUrl(pictureUrl);
                        if (localPicturePath != null) {
                                user.setProfilePictureUrl(localPicturePath);
                                log.info(SECURITY_PREFIX
                                                + " Downloaded and stored profile picture for user: {}",
                                                user.getEmail());
                        } else {
                                log.warn(SECURITY_PREFIX
                                                + " Failed to download profile picture from URL: {}",
                                                pictureUrl);
                                user.setProfilePictureUrl(null);
                        }
                }

                user.setProviderId(providerId);
        }

        private String[] splitName(String fullName) {
                if (fullName == null || fullName.trim().isEmpty()) {
                        return new String[] {"Unknown", null};
                }

                String[] parts = fullName.trim().split("\\s+", 2);
                String firstName = parts[0];
                String lastName = parts.length > 1 ? parts[1] : null;

                return new String[] {firstName, lastName};
        }
}
