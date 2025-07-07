// File: backend/src/main/java/com/synchboard/backend/controller/AuthController.java

package com.synchboard.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.synchboard.backend.dto.auth.RegisterRequest;
import com.synchboard.backend.service.UserService;

/**
 * REST Controller for authentication endpoints under the "/api/auth" path.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * Handles the POST request to register a new user.
     *
     * @param registerRequest The request body containing registration details.
     * @return A {@link ResponseEntity} indicating success or failure.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            userService.registerUser(registerRequest);
            return ResponseEntity.ok("User registered successfully!");
        } catch (RuntimeException e) {
            // Return a specific error message if registration fails.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}