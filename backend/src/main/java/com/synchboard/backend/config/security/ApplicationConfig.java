// File: backend/src/main/java/com/synchboard/backend/config/security/ApplicationConfig.java
package com.synchboard.backend.config.security;

import com.synchboard.backend.repository.UserRepository;
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

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * Configuration class for Spring Security.
 * Sets up beans related to user details, authentication, and password encoding.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    /**
     * Defines the UserDetailsService bean which retrieves user details from the
     * database.
     *
     * @return an implementation of UserDetailsService that loads user-specific
     *         data.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findById(username)
                .orElseThrow(() -> new UsernameNotFoundException(ERROR_USER_NOT_FOUND_TEMPLATE + username));
    }

    /**
     * Defines the AuthenticationProvider bean.
     * This bean is responsible for authenticating a user with a username and
     * password.
     *
     * @return the configured DaoAuthenticationProvider.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Exposes the AuthenticationManager from the security configuration as a bean.
     *
     * @param config the authentication configuration.
     * @return the AuthenticationManager.
     * @throws Exception if an error occurs while getting the authentication
     *                   manager.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Defines the PasswordEncoder bean that uses the BCrypt hashing algorithm.
     *
     * @return the BCryptPasswordEncoder instance.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}