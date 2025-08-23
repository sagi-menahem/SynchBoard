package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.ERROR_VALIDATION;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.USER_NOT_FOUND;
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

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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

    @Transactional
    public void registerUser(RegisterRequest request) {
        log.info(SECURITY_PREFIX + " Registration attempt for email: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.existsById(request.getEmail())) {
            log.warn(SECURITY_PREFIX + " Registration failed for email: {}. Reason: {}",
                    request.getEmail(), "Email already exists");
            throw new ResourceConflictException(MessageConstants.EMAIL_IN_USE);
        }

        // Check if there's already a pending registration
        if (pendingRegistrationRepository.existsByEmail(request.getEmail())) {
            // Delete existing pending registration to allow re-registration
            pendingRegistrationRepository.deleteById(request.getEmail());
            log.info(SECURITY_PREFIX + " Existing pending registration deleted for email: {}", request.getEmail());
        }

        // Generate verification code and expiry time
        String verificationCode = emailService.generateVerificationCode();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15); // 15 minutes

        // Create pending registration
        PendingRegistration pendingRegistration = PendingRegistration.builder()
                .email(request.getEmail())
                .hashedPassword(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .verificationCode(verificationCode)
                .expiryTime(expiryTime)
                .attempts(0)
                .build();

        pendingRegistrationRepository.save(pendingRegistration);
        log.info(SECURITY_PREFIX + " Pending registration created for email: {}", request.getEmail());

        // Send verification email
        boolean emailSent = emailService.sendVerificationCode(request.getEmail(), verificationCode);
        if (!emailSent) {
            log.error(SECURITY_PREFIX + " Failed to send verification email to: {}", request.getEmail());
            // Don't throw exception, user can try to resend
        }

        log.info(SECURITY_PREFIX + " Verification email sent to: {}", request.getEmail());
    }

    public AuthResponseDTO login(LoginRequest request) {
        log.info(SECURITY_PREFIX + " Login attempt for user: {}", request.getEmail());

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

    @Transactional
    public void changePassword(String userEmail, String currentPassword, String newPassword) {
        log.info(SECURITY_PREFIX + " Password change attempt for user: {}", userEmail);

        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.error(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            log.warn(
                    SECURITY_PREFIX
                            + " Password change failed - incorrect current password for user: {}",
                    userEmail);
            throw new InvalidRequestException(MessageConstants.PASSWORD_INCORRECT);
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            log.warn(ERROR_VALIDATION, "newPassword", "[HIDDEN]",
                    "must be different from current password");
            throw new InvalidRequestException(MessageConstants.PASSWORD_SAME_AS_OLD);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info(SECURITY_PREFIX + " Password changed for user: {}", userEmail);
    }

    @Transactional
    public AuthResponseDTO verifyEmail(String email, String verificationCode) {
        log.info(SECURITY_PREFIX + " Email verification attempt for: {}", email);

        PendingRegistration pendingRegistration = pendingRegistrationRepository
                .findByEmail(email)
                .orElseThrow(() -> {
                    log.warn(SECURITY_PREFIX + " Verification failed - no pending registration for email: {}", email);
                    return new ResourceNotFoundException("No pending registration found for email: " + email);
                });

        // Check if expired
        if (pendingRegistration.isExpired()) {
            log.warn(SECURITY_PREFIX + " Verification code expired for email: {}", email);
            pendingRegistrationRepository.delete(pendingRegistration);
            throw new InvalidRequestException("Verification code has expired");
        }

        // Check if max attempts exceeded
        if (pendingRegistration.isMaxAttemptsReached()) {
            log.warn(SECURITY_PREFIX + " Max verification attempts exceeded for email: {}", email);
            pendingRegistrationRepository.delete(pendingRegistration);
            throw new InvalidRequestException("Too many verification attempts. Please register again.");
        }

        // Verify code
        if (!pendingRegistration.getVerificationCode().equals(verificationCode)) {
            pendingRegistration.incrementAttempts();
            pendingRegistrationRepository.save(pendingRegistration);
            log.warn(SECURITY_PREFIX + " Invalid verification code for email: {} (attempt: {})", 
                    email, pendingRegistration.getAttempts());
            throw new InvalidRequestException("Invalid verification code");
        }

        // Create actual user account
        User newUser = User.builder()
                .email(pendingRegistration.getEmail())
                .password(pendingRegistration.getHashedPassword())
                .firstName(pendingRegistration.getFirstName())
                .lastName(pendingRegistration.getLastName())
                .gender(pendingRegistration.getGender())
                .phoneNumber(pendingRegistration.getPhoneNumber())
                .dateOfBirth(pendingRegistration.getDateOfBirth())
                .build();

        userRepository.save(newUser);
        
        // Delete pending registration
        pendingRegistrationRepository.delete(pendingRegistration);
        
        log.info(SECURITY_PREFIX + " Email verified and user created for: {}", email);

        // Generate JWT token for automatic login
        String jwtToken = jwtService.generateToken(newUser);
        return new AuthResponseDTO(jwtToken);
    }

    @Transactional
    public void resendVerificationCode(String email) {
        log.info(SECURITY_PREFIX + " Resend verification code request for: {}", email);

        PendingRegistration pendingRegistration = pendingRegistrationRepository
                .findByEmail(email)
                .orElseThrow(() -> {
                    log.warn(SECURITY_PREFIX + " Resend failed - no pending registration for email: {}", email);
                    return new ResourceNotFoundException("No pending registration found for email: " + email);
                });

        // Generate new code and extend expiry
        String newVerificationCode = emailService.generateVerificationCode();
        pendingRegistration.setVerificationCode(newVerificationCode);
        pendingRegistration.setExpiryTime(LocalDateTime.now().plusMinutes(15));
        pendingRegistration.setAttempts(0); // Reset attempts

        pendingRegistrationRepository.save(pendingRegistration);

        // Send new verification email
        boolean emailSent = emailService.sendVerificationCode(email, newVerificationCode);
        if (!emailSent) {
            log.error(SECURITY_PREFIX + " Failed to resend verification email to: {}", email);
        }

        log.info(SECURITY_PREFIX + " Verification code resent to: {}", email);
    }

    @Transactional
    public void initiateForgotPassword(String email) {
        log.info(SECURITY_PREFIX + " Forgot password request for: {}", email);

        User user = userRepository.findById(email).orElseThrow(() -> {
            log.warn(SECURITY_PREFIX + " Forgot password failed - user not found: {}", email);
            return new ResourceNotFoundException("User not found with email: " + email);
        });

        // Generate reset code
        String resetCode = emailService.generateVerificationCode();
        LocalDateTime resetExpiry = LocalDateTime.now().plusMinutes(60); // 1 hour

        user.setResetCode(resetCode);
        user.setResetExpiry(resetExpiry);
        userRepository.save(user);

        // Send reset email
        boolean emailSent = emailService.sendPasswordResetCode(email, resetCode);
        if (!emailSent) {
            log.error(SECURITY_PREFIX + " Failed to send password reset email to: {}", email);
        }

        log.info(SECURITY_PREFIX + " Password reset code sent to: {}", email);
    }

    @Transactional
    public void resetPassword(String email, String resetCode, String newPassword) {
        log.info(SECURITY_PREFIX + " Password reset attempt for: {}", email);

        User user = userRepository.findById(email).orElseThrow(() -> {
            log.warn(SECURITY_PREFIX + " Password reset failed - user not found: {}", email);
            return new ResourceNotFoundException("User not found with email: " + email);
        });

        // Check if reset code exists
        if (user.getResetCode() == null || !user.getResetCode().equals(resetCode)) {
            log.warn(SECURITY_PREFIX + " Invalid reset code for user: {}", email);
            throw new InvalidRequestException("Invalid reset code");
        }

        // Check if reset code expired
        if (user.isResetCodeExpired()) {
            log.warn(SECURITY_PREFIX + " Reset code expired for user: {}", email);
            user.clearResetCode();
            userRepository.save(user);
            throw new InvalidRequestException("Reset code has expired");
        }

        // Update password and clear reset code
        user.setPassword(passwordEncoder.encode(newPassword));
        user.clearResetCode();
        userRepository.save(user);

        log.info(SECURITY_PREFIX + " Password reset successful for: {}", email);
    }
}
