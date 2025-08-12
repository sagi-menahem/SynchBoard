package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.*;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.API_REQUEST_COMPLETED;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.API_REQUEST_FAILED;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.API_REQUEST_RECEIVED;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.github.sagimenahem.synchboard.dto.auth.AuthResponseDTO;
import io.github.sagimenahem.synchboard.dto.auth.LoginRequest;
import io.github.sagimenahem.synchboard.dto.auth.RegisterRequest;
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
    public ResponseEntity<AuthResponseDTO> registerUser(@RequestBody RegisterRequest request) {
        log.info(API_REQUEST_RECEIVED, "POST", API_AUTH_BASE_PATH + API_AUTH_REGISTER_PATH,
                request.getEmail());
        long startTime = System.currentTimeMillis();

        try {
            AuthResponseDTO response = authService.registerUser(request);
            long duration = System.currentTimeMillis() - startTime;
            log.info(API_REQUEST_COMPLETED, "POST", API_AUTH_BASE_PATH + API_AUTH_REGISTER_PATH,
                    request.getEmail(), duration);
            return ResponseEntity.ok(response);
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

    @GetMapping(API_AUTH_TEST_PATH)
    public ResponseEntity<String> testEndpoint() {
        log.debug("Test endpoint accessed");
        return ResponseEntity.ok(AUTH_TEST_ENDPOINT_SUCCESS_MESSAGE);
    }
}
