package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.API_AUTH_BASE_PATH;
import static io.github.sagimenahem.synchboard.constants.ApiConstants.API_AUTH_LOGIN_PATH;
import static io.github.sagimenahem.synchboard.constants.ApiConstants.API_AUTH_REGISTER_PATH;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.github.sagimenahem.synchboard.dto.auth.*;
import io.github.sagimenahem.synchboard.service.auth.AuthService;
import io.github.sagimenahem.synchboard.service.util.ApiLoggingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller responsible for handling authentication-related HTTP requests. Manages user
 * registration, login, email verification, and password reset operations with comprehensive logging
 * and error handling for security-critical operations.
 * 
 * @author Sagi Menahem
 */
@Slf4j
@RestController
@RequestMapping(API_AUTH_BASE_PATH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final ApiLoggingService apiLoggingService;

    /**
     * Registers a new user account and initiates email verification process. Creates a pending
     * registration entry and sends a verification code to the provided email address. If email
     * verification is disabled, returns authentication token for immediate login.
     * 
     * @param request the registration details including email, password, and user information
     * @return ResponseEntity containing either success message for email verification or
     *         AuthResponseDTO for immediate login
     */
    @PostMapping(API_AUTH_REGISTER_PATH)
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        // Execute registration with comprehensive logging for security audit trail
        return apiLoggingService.executeWithLogging("POST",
                API_AUTH_BASE_PATH + API_AUTH_REGISTER_PATH, request.getEmail(), () -> {
                    AuthResponseDTO authResponse = authService.registerUser(request);
                    if (authResponse != null) {
                        // Email verification disabled - return auth token for immediate login
                        return ResponseEntity.ok(authResponse);
                    } else {
                        // Email verification enabled - return message to check email
                        return ResponseEntity.ok(
                                "Verification email sent. Please check your email and enter the verification code.");
                    }
                });
    }

    /**
     * Authenticates a user with email and password credentials. Validates user credentials and
     * returns JWT token for authenticated sessions.
     * 
     * @param request the login credentials containing email and password
     * @return ResponseEntity containing authentication response with JWT token and user details
     */
    @PostMapping(API_AUTH_LOGIN_PATH)
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequest request) {
        // Execute login with security logging to track authentication attempts
        return apiLoggingService.executeWithLogging("POST",
                API_AUTH_BASE_PATH + API_AUTH_LOGIN_PATH, request.getEmail(), () -> {
                    AuthResponseDTO response = authService.login(request);
                    return ResponseEntity.ok(response);
                });
    }

    /**
     * Verifies user email address using the provided verification code. Completes the registration
     * process by validating the verification code sent to user's email.
     * 
     * @param request the verification details containing email and verification code
     * @return ResponseEntity containing authentication response with JWT token upon successful
     *         verification
     */
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponseDTO> verifyEmail(@RequestBody VerifyEmailRequest request) {
        // Execute email verification with logging to track registration completion
        return apiLoggingService.executeWithLogging("POST", API_AUTH_BASE_PATH + "/verify-email",
                request.getEmail(), () -> {
                    AuthResponseDTO response = authService.verifyEmail(request.getEmail(),
                            request.getVerificationCode());
                    return ResponseEntity.ok(response);
                });
    }

    /**
     * Resends verification code to user's email address. Generates and sends a new verification
     * code for users who didn't receive or lost their original code.
     * 
     * @param request the resend request containing the email address
     * @return ResponseEntity containing success message about verification code being resent
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerificationCode(
            @RequestBody ResendVerificationRequest request) {
        return apiLoggingService.executeWithLogging("POST",
                API_AUTH_BASE_PATH + "/resend-verification", request.getEmail(), () -> {
                    authService.resendVerificationCode(request.getEmail());
                    return ResponseEntity.ok("Verification code resent successfully.");
                });
    }

    /**
     * Initiates password reset process by sending reset code to user's email. Generates a secure
     * reset code and emails it to the user for password recovery.
     * 
     * @param request the forgot password request containing the user's email address
     * @return ResponseEntity containing success message about reset code being sent
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return apiLoggingService.executeWithLogging("POST", API_AUTH_BASE_PATH + "/forgot-password",
                request.getEmail(), () -> {
                    authService.initiateForgotPassword(request.getEmail());
                    return ResponseEntity.ok("Password reset code sent to your email.");
                });
    }

    /**
     * Resets user password using the provided reset code and new password. Validates the reset code,
     * updates the user's password, and returns authentication token for automatic login.
     *
     * @param request the password reset details containing email, reset code, and new password
     * @return ResponseEntity containing authentication response with JWT token for auto-login
     */
    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponseDTO> resetPassword(@RequestBody ResetPasswordRequest request) {
        // Execute password reset with logging for security monitoring
        return apiLoggingService.executeWithLogging("POST", API_AUTH_BASE_PATH + "/reset-password",
                request.getEmail(), () -> {
                    AuthResponseDTO response = authService.resetPassword(request.getEmail(),
                            request.getResetCode(), request.getNewPassword());
                    return ResponseEntity.ok(response);
                });
    }
}
