package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.github.sagimenahem.synchboard.dto.auth.AuthResponseDTO;
import io.github.sagimenahem.synchboard.dto.auth.ForgotPasswordRequest;
import io.github.sagimenahem.synchboard.dto.auth.LoginRequest;
import io.github.sagimenahem.synchboard.dto.auth.RegisterRequest;
import io.github.sagimenahem.synchboard.dto.auth.ResendVerificationRequest;
import io.github.sagimenahem.synchboard.dto.auth.ResetPasswordRequest;
import io.github.sagimenahem.synchboard.dto.auth.VerifyEmailRequest;
import io.github.sagimenahem.synchboard.service.auth.AuthService;
import io.github.sagimenahem.synchboard.service.util.ApiLoggingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping(API_AUTH_BASE_PATH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final ApiLoggingService apiLoggingService;

    @PostMapping(API_AUTH_REGISTER_PATH)
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest request) {
        return apiLoggingService.executeWithLogging(
            "POST", 
            API_AUTH_BASE_PATH + API_AUTH_REGISTER_PATH, 
            request.getEmail(),
            () -> {
                authService.registerUser(request);
                return ResponseEntity.ok("Verification email sent. Please check your email and enter the verification code.");
            }
        );
    }

    @PostMapping(API_AUTH_LOGIN_PATH)
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequest request) {
        return apiLoggingService.executeWithLogging(
            "POST", 
            API_AUTH_BASE_PATH + API_AUTH_LOGIN_PATH, 
            request.getEmail(),
            () -> {
                AuthResponseDTO response = authService.login(request);
                return ResponseEntity.ok(response);
            }
        );
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponseDTO> verifyEmail(@RequestBody VerifyEmailRequest request) {
        return apiLoggingService.executeWithLogging(
            "POST", 
            API_AUTH_BASE_PATH + "/verify-email", 
            request.getEmail(),
            () -> {
                AuthResponseDTO response = authService.verifyEmail(request.getEmail(), request.getVerificationCode());
                return ResponseEntity.ok(response);
            }
        );
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerificationCode(@RequestBody ResendVerificationRequest request) {
        return apiLoggingService.executeWithLogging(
            "POST", 
            API_AUTH_BASE_PATH + "/resend-verification", 
            request.getEmail(),
            () -> {
                authService.resendVerificationCode(request.getEmail());
                return ResponseEntity.ok("Verification code resent successfully.");
            }
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return apiLoggingService.executeWithLogging(
            "POST", 
            API_AUTH_BASE_PATH + "/forgot-password", 
            request.getEmail(),
            () -> {
                authService.initiateForgotPassword(request.getEmail());
                return ResponseEntity.ok("Password reset code sent to your email.");
            }
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        return apiLoggingService.executeWithLogging(
            "POST", 
            API_AUTH_BASE_PATH + "/reset-password", 
            request.getEmail(),
            () -> {
                authService.resetPassword(request.getEmail(), request.getResetCode(), request.getNewPassword());
                return ResponseEntity.ok("Password reset successful. You can now log in with your new password.");
            }
        );
    }

    @GetMapping(API_AUTH_TEST_PATH)
    public ResponseEntity<String> testEndpoint() {
        log.debug("Test endpoint accessed");
        return ResponseEntity.ok(AUTH_TEST_ENDPOINT_SUCCESS_MESSAGE);
    }
}
