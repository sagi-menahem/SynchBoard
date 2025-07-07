// File: backend/src/main/java/com/synchboard/backend/service/UserService.java

package com.synchboard.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.synchboard.backend.dto.auth.RegisterRequest;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.repository.UserRepository;

/**
 * Service class for user-related business logic.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registers a new user in the system.
     *
     * @param request The DTO containing the registration details.
     * @return The newly created and saved {@link User} entity.
     * @throws RuntimeException if the email is already in use.
     */
    public User registerUser(RegisterRequest request) {
        // Prevent registration with an email that is already in use.
        if (userRepository.existsById(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // TODO: Implement password strength validation as per phase B requirements.

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setPhoneNumber(request.getPhoneNumber());

        // Encode the password for security before persisting.
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        // TODO: Implement email verification logic (generate token, save it, and send verification email).

        return userRepository.save(newUser);
    }

    // TODO: Implement login service method.
    // TODO: Implement service methods for updating user details and password reset.
}