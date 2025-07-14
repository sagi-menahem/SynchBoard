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

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

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

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = userRepository.findById(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException(ERROR_USER_NOT_FOUND_AFTER_AUTH));

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }
}