package io.github.sagimenahem.synchboard.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.auth.AuthResponse;
import io.github.sagimenahem.synchboard.dto.auth.LoginRequest;
import io.github.sagimenahem.synchboard.dto.auth.RegisterRequest;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import io.github.sagimenahem.synchboard.exception.ResourceConflictException;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());
        
        if (userRepository.existsById(request.getEmail())) {
            log.warn("Registration failed - email already exists: {}", request.getEmail());
            throw new ResourceConflictException(MessageConstants.EMAIL_IN_USE);
        }

        User newUser = User.builder().firstName(request.getFirstName())
                .lastName(request.getLastName()).email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber()).build();

        userRepository.save(newUser);
        log.info("User registered successfully: {}", request.getEmail());

        String jwtToken = jwtService.generateToken(newUser);
        log.debug("JWT token generated for new user: {}", request.getEmail());
        return new AuthResponse(jwtToken);
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            log.info("Login successful for email: {}", request.getEmail());
        } catch (Exception e) {
            log.warn("Login failed for email: {} - {}", request.getEmail(), e.getMessage());
            throw e;
        }

        User user = userRepository.findById(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND));

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }

    @Transactional
    public void changePassword(String userEmail, String currentPassword, String newPassword) {
        log.info("Password change attempt for user: {}", userEmail);
        
        User user = userRepository.findById(userEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            log.warn("Password change failed - incorrect current password for user: {}", userEmail);
            throw new InvalidRequestException(MessageConstants.PASSWORD_INCORRECT);
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new InvalidRequestException(MessageConstants.PASSWORD_SAME_AS_OLD);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", userEmail);
    }
}
