package io.github.sagimenahem.synchboard.service.auth;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.ERROR_VALIDATION;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.USER_NOT_FOUND;
import static io.github.sagimenahem.synchboard.constants.SecurityConstants.EMAIL_VERIFICATION_TIMEOUT_MINUTES;
import static io.github.sagimenahem.synchboard.constants.SecurityConstants.PASSWORD_RESET_TIMEOUT_MINUTES;
import java.time.LocalDateTime;
import java.util.Locale;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.auth.AuthResponseDTO;
import io.github.sagimenahem.synchboard.dto.auth.LoginRequest;
import io.github.sagimenahem.synchboard.dto.auth.RegisterRequest;
import io.github.sagimenahem.synchboard.entity.PendingRegistration;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import io.github.sagimenahem.synchboard.exception.ResourceConflictException;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.PendingRegistrationRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service layer for handling user authentication and account management operations. Provides secure
 * user registration with email verification, login authentication, password management, and
 * comprehensive security logging for audit trails.
 * 
 * @author Sagi Menahem
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    /**
     * Registers a new user account with email verification process. Creates a pending registration
     * record and sends verification code to user's email. If email service is disabled,
     * automatically creates and verifies the user account.
     * 
     * @param request the user registration details including email, password, and personal
     *        information
     * @return AuthResponseDTO with JWT token if email verification is disabled, null if email
     *         verification is required
     * @throws ResourceConflictException if email is already in use
     */
    @Transactional
    public AuthResponseDTO registerUser(RegisterRequest request) {
        log.info("[SECURITY] Registration attempt for email: {}", request.getEmail());

        // Ensure email is not already registered
        validateUserRegistration(request.getEmail());

        if (!emailService.isEmailEnabled()) {
            // Email service disabled - create user directly and return auth token
            log.info(SECURITY_PREFIX + " Email service disabled - auto-verifying user: {}",
                    request.getEmail());
            User user = createUserDirectly(request);
            userRepository.save(user);
            log.info(
                    SECURITY_PREFIX
                            + " User registration completed without email verification for: {}",
                    request.getEmail());
            return generateAuthResponse(user);
        } else {
            // Normal email verification flow
            // Remove any existing incomplete registration attempts
            cleanupExistingPendingRegistration(request.getEmail());
            // Create new pending registration with verification code
            PendingRegistration pendingRegistration = createPendingRegistration(request);
            // Send verification email to complete registration
            sendVerificationEmail(pendingRegistration);
            log.info(SECURITY_PREFIX + " User registration process completed for email: {}",
                    request.getEmail());
            return null;
        }
    }

    /**
     * Authenticates user credentials and generates JWT token for session management. Validates
     * email and password combination against stored user data.
     * 
     * @param request the login credentials containing email and password
     * @return AuthResponseDTO containing JWT token for authenticated session
     * @throws ResourceNotFoundException if user account does not exist
     */
    public AuthResponseDTO login(LoginRequest request) {
        log.info("[SECURITY] Login attempt for user: {}", request.getEmail());

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    request.getEmail(), request.getPassword()));
            log.info(SECURITY_PREFIX + " Login successful for user: {}", request.getEmail());
        } catch (Exception e) {
            log.warn(SECURITY_PREFIX + " Login failed for user: {}. Reason: {}", request.getEmail(),
                    e.getMessage());
            throw e;
        }

        User user = userRepository.findById(request.getEmail()).orElseThrow(() -> {
            log.error(USER_NOT_FOUND, request.getEmail());
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND);
        });

        String jwtToken = jwtService.generateToken(user);
        log.debug(SECURITY_PREFIX + " JWT token generated for user: {}", request.getEmail());
        return new AuthResponseDTO(jwtToken);
    }

    /**
     * Changes user's password after validating current password. Ensures new password is different
     * from current password for security.
     * 
     * @param userEmail the email address of the user changing password
     * @param currentPassword the user's current password for verification
     * @param newPassword the new password to set
     * @throws ResourceNotFoundException if user account does not exist
     * @throws InvalidRequestException if current password is incorrect or new password is same as
     *         current
     */
    @Transactional
    public void changePassword(String userEmail, String currentPassword, String newPassword) {
        log.info(SECURITY_PREFIX + " Password change attempt for user: {}", userEmail);

        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.error(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });

        // Verify current password before allowing change
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            log.warn(
                    SECURITY_PREFIX
                            + " Password change failed - incorrect current password for user: {}",
                    userEmail);
            throw new InvalidRequestException(MessageConstants.PASSWORD_INCORRECT);
        }

        // Ensure new password is different from current password
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            log.warn(ERROR_VALIDATION, "newPassword", "[HIDDEN]",
                    "Must be different from current password");
            throw new InvalidRequestException(MessageConstants.PASSWORD_SAME_AS_OLD);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info(SECURITY_PREFIX + " Password changed for user: {}", userEmail);
    }

    /**
     * Verifies user email address using verification code and completes registration. Creates the
     * actual user account after successful email verification.
     * 
     * @param email the email address to verify
     * @param verificationCode the verification code sent to user's email
     * @return AuthResponseDTO containing JWT token for the newly verified user
     * @throws ResourceNotFoundException if no pending registration exists
     * @throws InvalidRequestException if verification code is invalid, expired, or max attempts
     *         exceeded
     */
    @Transactional
    public AuthResponseDTO verifyEmail(String email, String verificationCode) {
        log.info(SECURITY_PREFIX + " Email verification attempt for: {}", email);

        // Find and validate pending registration
        PendingRegistration pendingRegistration = findPendingRegistration(email);
        validateVerificationAttempt(pendingRegistration, verificationCode, email);

        // Create actual user account from pending registration data
        User newUser = createAndSaveUser(pendingRegistration);
        // Remove pending registration as it's no longer needed
        cleanupPendingRegistration(pendingRegistration);

        log.info(SECURITY_PREFIX + " Email verified and user created for: {}", email);
        return generateAuthResponse(newUser);
    }

    private PendingRegistration findPendingRegistration(String email) {
        return pendingRegistrationRepository.findByEmail(email).orElseThrow(() -> {
            log.warn(
                    SECURITY_PREFIX
                            + " Verification failed - no pending registration for email: {}",
                    email);
            return new ResourceNotFoundException(
                    "No pending registration found for email: " + email);
        });
    }

    private void validateVerificationAttempt(PendingRegistration pendingRegistration,
            String verificationCode, String email) {
        // Check expiration first - expired codes are immediately deleted to prevent reuse
        if (pendingRegistration.isExpired()) {
            log.warn(SECURITY_PREFIX + " Verification code expired for email: {}", email);
            pendingRegistrationRepository.delete(pendingRegistration);
            throw new InvalidRequestException("Verification code has expired");
        }

        // Enforce attempt limits to prevent brute force attacks on verification codes
        // Max attempts reached triggers immediate cleanup to block further attempts
        if (pendingRegistration.isMaxAttemptsReached()) {
            log.warn(SECURITY_PREFIX + " Max verification attempts exceeded for email: {}", email);
            pendingRegistrationRepository.delete(pendingRegistration);
            throw new InvalidRequestException(
                    "Too many verification attempts. Please register again.");
        }

        // Validate verification code and increment attempt counter on failure
        // This provides rate limiting while maintaining security audit trail
        if (!pendingRegistration.getVerificationCode().equals(verificationCode)) {
            pendingRegistration.incrementAttempts();
            pendingRegistrationRepository.save(pendingRegistration);
            log.warn(SECURITY_PREFIX + " Invalid verification code for email: {} (attempt: {})",
                    email, pendingRegistration.getAttempts());
            throw new InvalidRequestException("Invalid verification code");
        }
    }

    private void validateUserRegistration(String email) {
        if (userRepository.existsById(email)) {
            log.warn("[SECURITY] Registration failed for email: {}. Reason: {}", email,
                    "Email already exists");
            throw new ResourceConflictException(MessageConstants.EMAIL_IN_USE);
        }
    }

    private void cleanupExistingPendingRegistration(String email) {
        if (pendingRegistrationRepository.existsByEmail(email)) {
            pendingRegistrationRepository.deleteById(email);
            log.info(SECURITY_PREFIX + " Existing pending registration deleted for email: {}",
                    email);
        }
    }

    private PendingRegistration createPendingRegistration(RegisterRequest request) {
        String verificationCode = emailService.generateVerificationCode();
        LocalDateTime expiryTime =
                LocalDateTime.now().plusMinutes(EMAIL_VERIFICATION_TIMEOUT_MINUTES);

        PendingRegistration pendingRegistration =
                PendingRegistration.builder().email(request.getEmail())
                        .hashedPassword(passwordEncoder.encode(request.getPassword()))
                        .firstName(request.getFirstName()).lastName(request.getLastName())
                        .gender(request.getGender()).phoneNumber(request.getPhoneNumber())
                        .dateOfBirth(request.getDateOfBirth()).verificationCode(verificationCode)
                        .expiryTime(expiryTime).attempts(0).build();

        pendingRegistrationRepository.save(pendingRegistration);
        log.info(SECURITY_PREFIX + " Pending registration created for email: {}",
                request.getEmail());
        return pendingRegistration;
    }

    private void sendVerificationEmail(PendingRegistration pendingRegistration) {
        // For initial verification email, use default locale since we don't store language
        // preference in PendingRegistration
        boolean emailSent = emailService.sendVerificationCode(pendingRegistration.getEmail(),
                pendingRegistration.getVerificationCode(), Locale.ENGLISH);
        if (!emailSent) {
            log.error(SECURITY_PREFIX + " Failed to send verification email to: {}",
                    pendingRegistration.getEmail());
        } else {
            log.info(SECURITY_PREFIX + " Verification email sent to: {}",
                    pendingRegistration.getEmail());
        }
    }

    private User createAndSaveUser(PendingRegistration pendingRegistration) {
        User newUser = createUserFromPendingRegistration(pendingRegistration);
        userRepository.save(newUser);
        return newUser;
    }

    private void cleanupPendingRegistration(PendingRegistration pendingRegistration) {
        pendingRegistrationRepository.delete(pendingRegistration);
    }

    private AuthResponseDTO generateAuthResponse(User user) {
        String jwtToken = jwtService.generateToken(user);
        return new AuthResponseDTO(jwtToken);
    }

    private User createUserFromPendingRegistration(PendingRegistration pendingRegistration) {
        return User.builder().email(pendingRegistration.getEmail())
                .password(pendingRegistration.getHashedPassword())
                .firstName(pendingRegistration.getFirstName())
                .lastName(pendingRegistration.getLastName()).gender(pendingRegistration.getGender())
                .phoneNumber(pendingRegistration.getPhoneNumber())
                .dateOfBirth(pendingRegistration.getDateOfBirth())
                .boardBackgroundSetting("--board-bg-default").build();
    }

    /**
     * Creates a user directly from registration request when email verification is disabled.
     * 
     * @param request the registration request containing user details
     * @return the created User entity (auto-verified since email service is disabled)
     */
    private User createUserDirectly(RegisterRequest request) {
        return User.builder().email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName()).lastName(request.getLastName())
                .gender(request.getGender()).phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth()).boardBackgroundSetting("--board-bg-default")
                .build();
    }

    /**
     * Resends verification code to user's email address. Generates new verification code and resets
     * attempt counter for pending registration.
     * 
     * @param email the email address to resend verification code to
     * @throws ResourceNotFoundException if no pending registration exists for email
     */
    @Transactional
    public void resendVerificationCode(String email) {
        log.info(SECURITY_PREFIX + " Resend verification code request for: {}", email);

        PendingRegistration pendingRegistration = findPendingRegistration(email);

        String newVerificationCode = emailService.generateVerificationCode();
        pendingRegistration.setVerificationCode(newVerificationCode);
        pendingRegistration
                .setExpiryTime(LocalDateTime.now().plusMinutes(EMAIL_VERIFICATION_TIMEOUT_MINUTES));
        pendingRegistration.setAttempts(0);

        pendingRegistrationRepository.save(pendingRegistration);

        // For resend verification, use default locale since we don't store language preference in
        // PendingRegistration
        boolean emailSent =
                emailService.sendVerificationCode(email, newVerificationCode, Locale.ENGLISH);
        if (!emailSent) {
            log.error(SECURITY_PREFIX + " Failed to resend verification email to: {}", email);
        }

        log.info(SECURITY_PREFIX + " Verification code resent to: {}", email);
    }

    /**
     * Initiates password reset process by generating and sending reset code. Creates temporary
     * reset code with expiration time for secure password recovery.
     * 
     * @param email the email address of user requesting password reset
     * @throws ResourceNotFoundException if user account does not exist
     */
    @Transactional
    public void initiateForgotPassword(String email) {
        log.info(SECURITY_PREFIX + " Forgot password request for: {}", email);

        User user = userRepository.findById(email).orElseThrow(() -> {
            log.warn(SECURITY_PREFIX + " Forgot password failed - user not found: {}", email);
            return new ResourceNotFoundException("User not found with email: " + email);
        });

        String resetCode = emailService.generateVerificationCode();
        LocalDateTime resetExpiry = LocalDateTime.now().plusMinutes(PASSWORD_RESET_TIMEOUT_MINUTES);

        user.setResetCode(resetCode);
        user.setResetExpiry(resetExpiry);
        userRepository.save(user);

        // Get user's preferred language and send localized email
        Locale userLocale = getUserLocale(user);
        boolean emailSent = emailService.sendPasswordResetCode(email, resetCode, userLocale);
        if (!emailSent) {
            log.error(SECURITY_PREFIX + " Failed to send password reset email to: {}", email);
        }

        log.info(SECURITY_PREFIX + " Password reset code sent to: {}", email);
    }

    /**
     * Resets user password using valid reset code and returns authentication token for auto-login.
     * Validates reset code and expiration before updating user's password.
     *
     * @param email the email address of user resetting password
     * @param resetCode the reset code sent to user's email
     * @param newPassword the new password to set
     * @return AuthResponseDTO containing JWT token for automatic login after password reset
     * @throws ResourceNotFoundException if user account does not exist
     * @throws InvalidRequestException if reset code is invalid or expired
     */
    @Transactional
    public AuthResponseDTO resetPassword(String email, String resetCode, String newPassword) {
        log.info(SECURITY_PREFIX + " Password reset attempt for: {}", email);

        User user = userRepository.findById(email).orElseThrow(() -> {
            log.warn(SECURITY_PREFIX + " Password reset failed - user not found: {}", email);
            return new ResourceNotFoundException("User not found with email: " + email);
        });

        if (user.getResetCode() == null || !user.getResetCode().equals(resetCode)) {
            log.warn(SECURITY_PREFIX + " Invalid reset code for user: {}", email);
            throw new InvalidRequestException("Invalid reset code");
        }

        if (user.isResetCodeExpired()) {
            log.warn(SECURITY_PREFIX + " Reset code expired for user: {}", email);
            user.clearResetCode();
            userRepository.save(user);
            throw new InvalidRequestException("Reset code has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.clearResetCode();
        userRepository.save(user);

        log.info(SECURITY_PREFIX + " Password reset successful for: {}", email);
        return generateAuthResponse(user);
    }

    /**
     * Converts user's preferred language string to Locale object.
     * 
     * @param user the user entity containing language preference
     * @return Locale based on user's preferred language, defaults to English if not set
     */
    private Locale getUserLocale(User user) {
        if (user == null || user.getPreferredLanguage() == null) {
            return Locale.ENGLISH;
        }

        String lang = user.getPreferredLanguage();
        if ("he".equals(lang)) {
            return Locale.of("he");
        }

        return Locale.ENGLISH; // Default fallback
    }
}
