package io.github.sagimenahem.synchboard.service.auth;

import static io.github.sagimenahem.synchboard.constants.FileConstants.IMAGES_BASE_PATH;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import io.github.sagimenahem.synchboard.dto.auth.GoogleUserInfo;
import io.github.sagimenahem.synchboard.entity.PendingRegistration;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import io.github.sagimenahem.synchboard.repository.PendingRegistrationRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import io.github.sagimenahem.synchboard.service.storage.FileStorageService;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Service for processing Google authentication across different flows (OAuth2 redirect and One
 * Tap). Handles user creation, account merging, profile picture management, and Google ID Token
 * verification. This service centralizes all Google-related authentication logic to ensure
 * consistent behavior between authentication methods.
 *
 * @author Sagi Menahem
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final FileStorageService fileStorageService;
    private final JwtService jwtService;

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    private GoogleIdTokenVerifier googleIdTokenVerifier;

    /**
     * Initializes the Google ID Token verifier after dependency injection. Only initializes if
     * Google Client ID is configured.
     */
    @PostConstruct
    public void init() {
        if (StringUtils.hasText(googleClientId)) {
            googleIdTokenVerifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                            .setAudience(Collections.singletonList(googleClientId)).build();
            log.info(SECURITY_PREFIX + " Google ID Token verifier initialized");
        } else {
            log.warn(SECURITY_PREFIX
                    + " Google Client ID not configured - One Tap authentication disabled");
        }
    }

    /**
     * Verifies a Google ID Token from One Tap authentication and extracts user information.
     *
     * @param idTokenString The raw ID Token string from Google One Tap
     * @return GoogleUserInfo containing the verified user data
     * @throws InvalidRequestException if the token is invalid or verification fails
     */
    public GoogleUserInfo verifyIdToken(String idTokenString) {
        if (googleIdTokenVerifier == null) {
            log.error(SECURITY_PREFIX + " Google One Tap attempted but verifier not initialized");
            throw new InvalidRequestException("Google authentication is not configured");
        }

        try {
            GoogleIdToken idToken = googleIdTokenVerifier.verify(idTokenString);
            if (idToken == null) {
                log.warn(SECURITY_PREFIX + " Invalid Google ID Token received");
                throw new InvalidRequestException("Invalid Google ID Token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String providerId = payload.getSubject();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            log.info(SECURITY_PREFIX + " Google ID Token verified successfully for: {}", email);

            return GoogleUserInfo.builder().email(email).providerId(providerId).name(name)
                    .pictureUrl(pictureUrl).build();

        } catch (GeneralSecurityException | IOException e) {
            log.error(SECURITY_PREFIX + " Error verifying Google ID Token: {}", e.getMessage());
            throw new InvalidRequestException("Failed to verify Google ID Token");
        }
    }

    /**
     * Processes Google user information and returns a JWT token. This method handles user creation,
     * updates, and account merging based on the user's existing state. Used by both OAuth2 redirect
     * flow and One Tap flow.
     *
     * @param googleUserInfo The Google user information to process
     * @return JWT token string for the authenticated user
     * @throws InvalidRequestException if required user information is missing
     */
    @Transactional
    public String processGoogleUser(GoogleUserInfo googleUserInfo) {
        String email = googleUserInfo.getEmail();
        String providerId = googleUserInfo.getProviderId();
        String name = googleUserInfo.getName();
        String pictureUrl = googleUserInfo.getPictureUrl();

        if (email == null || providerId == null) {
            log.error(SECURITY_PREFIX
                    + " Missing required Google user data - email: {}, providerId: {}",
                    email != null, providerId != null);
            throw new InvalidRequestException("Missing required user information from Google");
        }

        Optional<User> existingUser = userRepository.findById(email);
        log.info(SECURITY_PREFIX + " Google user lookup result for {}: exists={}", email,
                existingUser.isPresent());

        User userForToken;

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            log.info(SECURITY_PREFIX
                    + " Found existing user: email={}, authProvider={}, creationDate={}", email,
                    user.getAuthProvider(), user.getCreationDate());

            // Account merging: Allow Google login for existing accounts regardless of auth provider
            if (user.getAuthProvider() == User.AuthProvider.GOOGLE) {
                // Pure OAuth2 user - update all fields from Google
                log.info(SECURITY_PREFIX + " Updating existing OAuth2 user data for: {}", email);
                updateUserFromGoogle(user, name, pictureUrl, providerId);
            } else {
                // LOCAL user - merge account safely (preserve password)
                log.info(SECURITY_PREFIX + " Merging LOCAL account with Google for: {}", email);
                mergeLocalUserWithGoogle(user, name, pictureUrl, providerId);
            }

            userForToken = userRepository.save(user);
            log.info(SECURITY_PREFIX + " Updated/merged user: {} (provider: {})", email,
                    user.getAuthProvider());
        } else {
            // Check if there's a pending registration for this email
            cleanupPendingRegistration(email);

            log.info(SECURITY_PREFIX + " Creating new Google user for: {}", email);
            User newUser = createUserFromGoogle(email, name, pictureUrl, providerId);
            userForToken = userRepository.save(newUser);
            log.info(SECURITY_PREFIX + " Created new Google user: {} with creation date: {}", email,
                    newUser.getCreationDate());
        }

        return jwtService.generateToken(userForToken);
    }

    /**
     * Creates a new User entity from Google user data. Downloads and stores the profile picture if
     * provided.
     *
     * @param email The user's email address
     * @param name The user's full name
     * @param pictureUrl The URL of the user's profile picture
     * @param providerId The Google provider's user identifier
     * @return A new User entity with Google data
     */
    private User createUserFromGoogle(String email, String name, String pictureUrl,
            String providerId) {
        String[] nameParts = splitName(name);

        String localPicturePath = null;
        if (pictureUrl != null) {
            localPicturePath = fileStorageService.downloadAndStoreImageFromUrl(pictureUrl);
            if (localPicturePath != null) {
                log.info(SECURITY_PREFIX + " Downloaded and stored profile picture for new user: {}",
                        email);
            } else {
                log.warn(SECURITY_PREFIX + " Failed to download profile picture from URL: {}",
                        pictureUrl);
            }
        }

        return User.builder().email(email).firstName(nameParts[0]).lastName(nameParts[1])
                .authProvider(User.AuthProvider.GOOGLE).providerId(providerId)
                .profilePictureUrl(localPicturePath).creationDate(LocalDateTime.now()).build();
    }

    /**
     * Updates an existing User entity with fresh Google data. Replaces the profile picture if a new
     * one is provided. This method is for users who originally registered via Google.
     *
     * @param user The existing user to update
     * @param name The updated full name
     * @param pictureUrl The updated profile picture URL
     * @param providerId The Google provider's user identifier
     */
    private void updateUserFromGoogle(User user, String name, String pictureUrl, String providerId) {
        if (name != null) {
            String[] nameParts = splitName(name);
            user.setFirstName(nameParts[0]);
            user.setLastName(nameParts[1]);
        }

        if (pictureUrl != null) {
            if (StringUtils.hasText(user.getProfilePictureUrl())) {
                // Extract filename from stored URL by removing the base path prefix
                String existingFilename =
                        user.getProfilePictureUrl().substring(IMAGES_BASE_PATH.length());
                if (existingFilename != null && !existingFilename.isBlank()) {
                    log.debug(SECURITY_PREFIX + " Deleting existing Google profile picture: {}",
                            existingFilename);
                    try {
                        fileStorageService.delete(existingFilename);
                        log.debug(SECURITY_PREFIX
                                + " Successfully deleted existing Google profile picture: {}",
                                existingFilename);
                    } catch (Exception e) {
                        log.warn(SECURITY_PREFIX
                                + " Failed to delete existing Google profile picture: {} - {}",
                                existingFilename, e.getMessage());
                    }
                }
            }

            String localPicturePath = fileStorageService.downloadAndStoreImageFromUrl(pictureUrl);
            if (localPicturePath != null) {
                user.setProfilePictureUrl(localPicturePath);
                log.info(SECURITY_PREFIX + " Downloaded and stored profile picture for user: {}",
                        user.getEmail());
            } else {
                log.warn(SECURITY_PREFIX + " Failed to download profile picture from URL: {}",
                        pictureUrl);
                user.setProfilePictureUrl(null);
            }
        }

        user.setProviderId(providerId);
    }

    /**
     * Merges an existing LOCAL user account with Google authentication. This method implements
     * strict safety rules to preserve the user's existing password and provider type while
     * selectively updating profile data from Google.
     *
     * <p>
     * Safety rules:
     * <ul>
     * <li>Password field is NEVER modified - user can still log in with email/password</li>
     * <li>AuthProvider remains LOCAL - preserves original registration method</li>
     * <li>Profile picture is only updated if current one is null/empty</li>
     * <li>ProviderId is set to link the Google account for future reference</li>
     * <li>Email verification token is cleared (Google verified the email)</li>
     * </ul>
     *
     * @param user The existing LOCAL user to merge with Google
     * @param name The user's name from Google (not used - preserve existing name)
     * @param pictureUrl The profile picture URL from Google
     * @param providerId The Google provider's user identifier
     */
    private void mergeLocalUserWithGoogle(User user, String name, String pictureUrl,
            String providerId) {
        // SAFETY: Do NOT change authProvider - keep as LOCAL so password login still works
        // SAFETY: Do NOT modify password field - it must remain untouched

        // Store the Google provider ID for account linking reference
        user.setProviderId(providerId);

        // Clear email verification token since Google has verified this email
        if (StringUtils.hasText(user.getEmailVerificationToken())) {
            log.info(SECURITY_PREFIX
                    + " Clearing email verification token for merged user: {} (Google verified)",
                    user.getEmail());
            user.setEmailVerificationToken(null);
        }

        // Only update profile picture if the user doesn't have one
        if (!StringUtils.hasText(user.getProfilePictureUrl()) && pictureUrl != null) {
            String localPicturePath = fileStorageService.downloadAndStoreImageFromUrl(pictureUrl);
            if (localPicturePath != null) {
                user.setProfilePictureUrl(localPicturePath);
                log.info(SECURITY_PREFIX
                        + " Downloaded and stored profile picture for merged user: {}",
                        user.getEmail());
            } else {
                log.warn(SECURITY_PREFIX
                        + " Failed to download profile picture from Google for merged user: {}",
                        user.getEmail());
            }
        }

        log.info(SECURITY_PREFIX
                + " Account merge complete for: {} - password preserved, authProvider remains LOCAL",
                user.getEmail());
    }

    /**
     * Cleans up any pending registration for the given email address. This is called when a user
     * signs in with Google before completing email verification - the Google login effectively
     * verifies ownership of the email address.
     *
     * @param email The email address to check for pending registrations
     */
    private void cleanupPendingRegistration(String email) {
        Optional<PendingRegistration> pending = pendingRegistrationRepository.findByEmail(email);
        if (pending.isPresent()) {
            log.info(SECURITY_PREFIX
                    + " Cleaning up pending registration for: {} (Google verifies email)", email);
            pendingRegistrationRepository.delete(pending.get());
        }
    }

    /**
     * Splits a full name into first and last name components.
     *
     * @param fullName The full name to split
     * @return Array containing [firstName, lastName], with lastName possibly null
     */
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
