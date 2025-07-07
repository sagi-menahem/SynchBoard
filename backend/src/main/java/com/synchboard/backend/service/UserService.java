// Located at: backend/src/main/java/com/synchboard/backend/service/UserService.java

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

/**
 * Service class for user-related business logic.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Registers a new user in the system.
     * @param request The DTO containing the registration details.
     * @return AuthResponse containing a JWT for the new user.
     * @throws RuntimeException if the email is already in use.
     */
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsById(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
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
     * Authenticates a user and returns a JWT.
     * @param request The DTO containing login credentials.
     * @return AuthResponse containing the JWT.
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );

        User user = userRepository.findById(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found after authentication"));

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }
}