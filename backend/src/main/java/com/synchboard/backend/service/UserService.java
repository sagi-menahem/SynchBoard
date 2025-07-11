// File: backend/src/main/java/com/synchboard/backend/service/UserService.java
package com.synchboard.backend.service;

import com.synchboard.backend.dto.auth.AuthResponse;
import com.synchboard.backend.dto.auth.LoginRequest;
import com.synchboard.backend.dto.auth.RegisterRequest;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * Service class for user-related operations like registration and login.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Registers a new user.
     *
     * @param request the registration request containing user details.
     * @return an authentication response with a JWT for the new user.
     * @throws RuntimeException if the email is already in use.
     */
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsById(request.getEmail())) {
            throw new RuntimeException(ERROR_EMAIL_IN_USE);
        }

        User newUser = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .build();

        userRepository.save(newUser);

        String jwtToken = jwtService.generateToken(newUser);
        return new AuthResponse(jwtToken);
    }

    /**
     * Authenticates a user and provides a JWT upon successful login.
     *
     * @param request the login request containing user credentials.
     * @return an authentication response with a new JWT.
     */
    public AuthResponse login(LoginRequest request) {
        // This will throw an exception if authentication fails.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        // If authentication is successful, find the user and generate a token.
        User user = userRepository.findById(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException(ERROR_USER_NOT_FOUND_AFTER_AUTH));

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }
}