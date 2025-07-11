// File: backend/src/main/java/com/synchboard/backend/controller/AuthController.java
package com.synchboard.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.synchboard.backend.dto.auth.AuthResponse;
import com.synchboard.backend.dto.auth.LoginRequest;
import com.synchboard.backend.dto.auth.RegisterRequest;
import com.synchboard.backend.service.UserService;

import lombok.RequiredArgsConstructor;

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * REST controller for handling authentication-related requests, such as user
 * registration and login.
 */
@RestController
@RequestMapping(API_AUTH_PATH)
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * Handles the user registration request.
     *
     * @param request the registration request data.
     * @return a ResponseEntity containing the authentication response with a JWT.
     */
    @PostMapping(API_AUTH_REGISTER_PATH)
    public ResponseEntity<AuthResponse> registerUser(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    /**
     * Handles the user login request.
     *
     * @param request the login request data.
     * @return a ResponseEntity containing the authentication response with a JWT.
     */
    @PostMapping(API_AUTH_LOGIN_PATH)
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    /**
     * A test endpoint to verify that a user is authenticated.
     *
     * @return a welcome message for authenticated users.
     */
    @GetMapping(API_AUTH_TEST_PATH)
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok(AUTH_TEST_ENDPOINT_SUCCESS_MESSAGE);
    }
}