// File: backend/src/main/java/com/synchboard/backend/controller/AuthController.java

package com.synchboard.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.synchboard.backend.dto.auth.RegisterRequest;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.service.UserService;

// @CrossOrigin allows requests from the specified origin.
// This is necessary because our React frontend will run on a different port (e.g., 3000)
// than our Spring Boot backend (e.g., 8080).
@CrossOrigin(origins = "http://localhost:3000") 
@RestController // Marks this class as a REST controller, where every method returns a domain object instead of a view.
@RequestMapping("/api/auth") // Maps all requests starting with /api/auth to this controller.
public class AuthController {

    @Autowired // Inject the UserService.
    private UserService userService;

    /**
     * Handles the HTTP POST request for user registration.
     * @param registerRequest The request body, automatically converted from JSON to a RegisterRequest object.
     * @return An HTTP response indicating success or failure.
     */
    @PostMapping("/register") // Maps POST requests for /api/auth/register to this method.
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            User registeredUser = userService.registerUser(registerRequest);
            // On success, return a 200 OK status with a success message in the body.
            return ResponseEntity.ok("User registered successfully!");
        } catch (RuntimeException e) {
            // If the email was already in use, the service throws an exception.
            // We catch it here and return a 400 Bad Request status with the error message.
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}