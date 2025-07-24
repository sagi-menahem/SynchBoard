// File: backend/src/main/java/com/synchboard/backend/controller/AuthController.java
package com.synchboard.backend.controller;

import static com.synchboard.backend.config.constants.ApiConstants.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.synchboard.backend.dto.auth.AuthResponse;
import com.synchboard.backend.dto.auth.LoginRequest;
import com.synchboard.backend.dto.auth.RegisterRequest;
import com.synchboard.backend.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(API_AUTH_PATH)
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping(API_AUTH_REGISTER_PATH)
    public ResponseEntity<AuthResponse> registerUser(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping(API_AUTH_LOGIN_PATH)
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping(API_AUTH_TEST_PATH)
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok(AUTH_TEST_ENDPOINT_SUCCESS_MESSAGE);
    }
}
