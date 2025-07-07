// File: backend/src/main/java/com/synchboard/backend/config/SecurityConfig.java

package com.synchboard.backend.config;

import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Configures application-wide security, including CORS, CSRF, and authorization rules.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Provides the password hashing implementation (BCrypt) for the application.
     * @return A {@link PasswordEncoder} instance.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Defines the main security filter chain for all HTTP requests.
     * @param http The {@link HttpSecurity} to configure.
     * @return The configured {@link SecurityFilterChain}.
     * @throws Exception if an error occurs during configuration.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Apply custom CORS configuration.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Disable CSRF protection, common for stateless REST APIs.
            .csrf(csrf -> csrf.disable()) 
            
            // Define authorization rules for endpoints.
            .authorizeHttpRequests(auth -> auth
                // Allow public access to all authentication-related endpoints.
                .requestMatchers("/api/auth/**").permitAll() 
                // All other requests must be authenticated.
                .anyRequest().authenticated() 
            );

        // TODO: Configure session management to be stateless once JWT authentication is implemented.
            
        return http.build();
    }

    /**
     * Defines the Cross-Origin Resource Sharing (CORS) configuration.
     * This allows the frontend client (e.g., from localhost:5173) to access the API.
     * @return A source for CORS configurations.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all URL paths.
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}