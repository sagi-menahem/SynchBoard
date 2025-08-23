package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.*;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.API_REQUEST_COMPLETED;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.API_REQUEST_FAILED;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.API_REQUEST_RECEIVED;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.github.sagimenahem.synchboard.dto.auth.AuthResponseDTO;
import io.github.sagimenahem.synchboard.dto.auth.ForgotPasswordRequest;
import io.github.sagimenahem.synchboard.dto.auth.LoginRequest;
import io.github.sagimenahem.synchboard.dto.auth.RegisterRequest;
import io.github.sagimenahem.synchboard.dto.auth.ResendVerificationRequest;
import io.github.sagimenahem.synchboard.dto.auth.ResetPasswordRequest;
import io.github.sagimenahem.synchboard.dto.auth.VerifyEmailRequest;
import io.github.sagimenahem.synchboard.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping(API_AUTH_BASE_PATH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(API_AUTH_REGISTER_PATH)
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest request) {
        log.info(API_REQUEST_RECEIVED, "POST", API_AUTH_BASE_PATH + API_AUTH_REGISTER_PATH,
                request.getEmail());
        long startTime = System.currentTimeMillis();

        try {
            authService.registerUser(request);
            long duration = System.currentTimeMillis() - startTime;
            log.info(API_REQUEST_COMPLETED, "POST", API_AUTH_BASE_PATH + API_AUTH_REGISTER_PATH,
                    request.getEmail(), duration);
            return ResponseEntity.ok("Verification email sent. Please check your email and enter the verification code.");
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error(API_REQUEST_FAILED, "POST", API_AUTH_BASE_PATH + API_AUTH_REGISTER_PATH,
                    request.getEmail(), e.getMessage() + " (Duration: " + duration + "ms)");
            throw e;
        }
    }

    @PostMapping(API_AUTH_LOGIN_PATH)
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequest request) {
        log.info(API_REQUEST_RECEIVED, "POST", API_AUTH_BASE_PATH + API_AUTH_LOGIN_PATH,
                request.getEmail());
        long startTime = System.currentTimeMillis();

        try {
            AuthResponseDTO response = authService.login(request);
            long duration = System.currentTimeMillis() - startTime;
            log.info(API_REQUEST_COMPLETED, "POST", API_AUTH_BASE_PATH + API_AUTH_LOGIN_PATH,
                    request.getEmail(), duration);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error(API_REQUEST_FAILED, "POST", API_AUTH_BASE_PATH + API_AUTH_LOGIN_PATH,
                    request.getEmail(), e.getMessage() + " (Duration: " + duration + "ms)");
            throw e;
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponseDTO> verifyEmail(@RequestBody VerifyEmailRequest request) {
        log.info(API_REQUEST_RECEIVED, "POST", API_AUTH_BASE_PATH + "/verify-email", request.getEmail());
        long startTime = System.currentTimeMillis();

        try {
            AuthResponseDTO response = authService.verifyEmail(request.getEmail(), request.getVerificationCode());
            long duration = System.currentTimeMillis() - startTime;
            log.info(API_REQUEST_COMPLETED, "POST", API_AUTH_BASE_PATH + "/verify-email", 
                    request.getEmail(), duration);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error(API_REQUEST_FAILED, "POST", API_AUTH_BASE_PATH + "/verify-email", 
                    request.getEmail(), e.getMessage() + " (Duration: " + duration + "ms)");
            throw e;
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerificationCode(@RequestBody ResendVerificationRequest request) {
        log.info(API_REQUEST_RECEIVED, "POST", API_AUTH_BASE_PATH + "/resend-verification", request.getEmail());
        long startTime = System.currentTimeMillis();

        try {
            authService.resendVerificationCode(request.getEmail());
            long duration = System.currentTimeMillis() - startTime;
            log.info(API_REQUEST_COMPLETED, "POST", API_AUTH_BASE_PATH + "/resend-verification", 
                    request.getEmail(), duration);
            return ResponseEntity.ok("Verification code resent successfully.");
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error(API_REQUEST_FAILED, "POST", API_AUTH_BASE_PATH + "/resend-verification", 
                    request.getEmail(), e.getMessage() + " (Duration: " + duration + "ms)");
            throw e;
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        log.info(API_REQUEST_RECEIVED, "POST", API_AUTH_BASE_PATH + "/forgot-password", request.getEmail());
        long startTime = System.currentTimeMillis();

        try {
            authService.initiateForgotPassword(request.getEmail());
            long duration = System.currentTimeMillis() - startTime;
            log.info(API_REQUEST_COMPLETED, "POST", API_AUTH_BASE_PATH + "/forgot-password", 
                    request.getEmail(), duration);
            return ResponseEntity.ok("Password reset code sent to your email.");
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error(API_REQUEST_FAILED, "POST", API_AUTH_BASE_PATH + "/forgot-password", 
                    request.getEmail(), e.getMessage() + " (Duration: " + duration + "ms)");
            throw e;
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        log.info(API_REQUEST_RECEIVED, "POST", API_AUTH_BASE_PATH + "/reset-password", request.getEmail());
        long startTime = System.currentTimeMillis();

        try {
            authService.resetPassword(request.getEmail(), request.getResetCode(), request.getNewPassword());
            long duration = System.currentTimeMillis() - startTime;
            log.info(API_REQUEST_COMPLETED, "POST", API_AUTH_BASE_PATH + "/reset-password", 
                    request.getEmail(), duration);
            return ResponseEntity.ok("Password reset successful. You can now log in with your new password.");
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error(API_REQUEST_FAILED, "POST", API_AUTH_BASE_PATH + "/reset-password", 
                    request.getEmail(), e.getMessage() + " (Duration: " + duration + "ms)");
            throw e;
        }
    }

    @GetMapping(API_AUTH_TEST_PATH)
    public ResponseEntity<String> testEndpoint() {
        log.debug("Test endpoint accessed");
        return ResponseEntity.ok(AUTH_TEST_ENDPOINT_SUCCESS_MESSAGE);
    }
}
