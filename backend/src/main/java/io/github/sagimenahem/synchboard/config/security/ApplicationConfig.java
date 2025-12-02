package io.github.sagimenahem.synchboard.config.security;

import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Security configuration class providing core authentication components. Configures user details
 * service, authentication provider, password encoder, and authentication manager for the Spring
 * Security framework.
 *
 * @author Sagi Menahem
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    /** Repository for accessing user data */
    private final UserRepository userRepository;

    /**
     * Creates a UserDetailsService bean that loads user details by username (email). Uses the
     * UserRepository to find users and throws UsernameNotFoundException if the user is not found.
     *
     * @return UserDetailsService implementation
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return (username) ->
            userRepository
                .findById(username)
                .orElseThrow(() -> new UsernameNotFoundException(MessageConstants.USER_NOT_FOUND + ": " + username));
    }

    /**
     * Creates a DaoAuthenticationProvider bean for database-based authentication. Configures the
     * provider with UserDetailsService and password encoder.
     *
     * @param userDetailsService Service for loading user details
     * @param passwordEncoder Encoder for password hashing and verification
     * @return AuthenticationProvider for DAO-based authentication
     */
    @Bean
    public AuthenticationProvider authenticationProvider(
        UserDetailsService userDetailsService,
        PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    /**
     * Creates an AuthenticationManager bean from the authentication configuration.
     *
     * @param config The authentication configuration
     * @return AuthenticationManager instance
     * @throws Exception if configuration fails
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Creates a BCryptPasswordEncoder bean for password hashing. Uses BCrypt algorithm with default
     * strength (10 rounds).
     *
     * @return PasswordEncoder implementation using BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
