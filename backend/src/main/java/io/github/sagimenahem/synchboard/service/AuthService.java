package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.ERROR_VALIDATION;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.USER_NOT_FOUND;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.auth.AuthResponseDTO;
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
    public AuthResponseDTO registerUser(RegisterRequest request) {
        log.info(SECURITY_PREFIX + " Registration attempt for email: {}", request.getEmail());

        if (userRepository.existsById(request.getEmail())) {
            log.warn(SECURITY_PREFIX + " Registration failed for email: {}. Reason: {}",
                    request.getEmail(), "Email already exists");
            throw new ResourceConflictException(MessageConstants.EMAIL_IN_USE);
        }

        User newUser = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .build();

        userRepository.save(newUser);
        log.info(SECURITY_PREFIX + " Registration successful for user: {}", request.getEmail());

        String jwtToken = jwtService.generateToken(newUser);
        log.debug(SECURITY_PREFIX + " JWT token generated for user: {}", request.getEmail());
        return new AuthResponseDTO(jwtToken);
    }

    public AuthResponseDTO login(LoginRequest request) {
        log.info(SECURITY_PREFIX + " Login attempt for user: {}", request.getEmail());

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    request.getEmail(), request.getPassword()));
            log.info(SECURITY_PREFIX + " Login successful for user: {}", request.getEmail());
        } catch (Exception e) {
            log.warn(SECURITY_PREFIX + " Login failed for user: {}. Reason: {}", request.getEmail(),
                    e.getMessage());
            throw e;
        }

        User user = userRepository.findById(request.getEmail()).orElseThrow(() -> {
            log.error(USER_NOT_FOUND, request.getEmail());
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND);
        });

        String jwtToken = jwtService.generateToken(user);
        log.debug(SECURITY_PREFIX + " JWT token generated for user: {}", request.getEmail());
        return new AuthResponseDTO(jwtToken);
    }

    @Transactional
    public void changePassword(String userEmail, String currentPassword, String newPassword) {
        log.info(SECURITY_PREFIX + " Password change attempt for user: {}", userEmail);

        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.error(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            log.warn(
                    SECURITY_PREFIX
                            + " Password change failed - incorrect current password for user: {}",
                    userEmail);
            throw new InvalidRequestException(MessageConstants.PASSWORD_INCORRECT);
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            log.warn(ERROR_VALIDATION, "newPassword", "[HIDDEN]",
                    "must be different from current password");
            throw new InvalidRequestException(MessageConstants.PASSWORD_SAME_AS_OLD);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info(SECURITY_PREFIX + " Password changed for user: {}", userEmail);
    }
}
