// Located at: backend/src/main/java/com/synchboard/backend/controller/AuthController.java

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

/**
 * REST Controller for authentication endpoints under the "/api/auth" path.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * Handles the POST request to register a new user.
     * On success, returns a JWT for the new user.
     *
     * @param request The request body containing registration details.
     * @return A ResponseEntity containing the AuthResponse with the JWT.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    /**
     * Handles the POST request to authenticate a user and provide a JWT.
     *
     * @param request The request body containing login credentials.
     * @return A ResponseEntity containing the AuthResponse with the JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    /**
     * A simple protected endpoint for testing authentication.
     * Accessing this requires a valid JWT.
     * 
     * @return A success message for authenticated users.
     */
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Hello, authenticated user!");
    }
}