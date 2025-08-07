package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.config.constants.ApiConstants.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.github.sagimenahem.synchboard.dto.auth.AuthResponse;
import io.github.sagimenahem.synchboard.dto.auth.LoginRequest;
import io.github.sagimenahem.synchboard.dto.auth.RegisterRequest;
import io.github.sagimenahem.synchboard.service.AuthService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(API_AUTH_BASE_PATH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(API_AUTH_REGISTER_PATH)
    public ResponseEntity<AuthResponse> registerUser(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registerUser(request));
    }

    @PostMapping(API_AUTH_LOGIN_PATH)
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping(API_AUTH_TEST_PATH)
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok(AUTH_TEST_ENDPOINT_SUCCESS_MESSAGE);
    }
}
