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

@Configuration
@EnableWebSecurity // This annotation enables Spring Security's web security support.
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // First, apply the global CORS configuration.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Then, disable CSRF protection (common for stateless REST APIs).
            .csrf(csrf -> csrf.disable()) 
            
            // Finally, define authorization rules.
            .authorizeHttpRequests(auth -> auth
                // Allow all requests to the /api/auth/** endpoints without authentication.
                .requestMatchers("/api/auth/**").permitAll() 
                // Any other request must be authenticated (we will use this rule later).
                .anyRequest().authenticated() 
            );
            
        return http.build();
    }

    @Bean
    // This bean defines the global CORS policy for the application.
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Specify the allowed origin (your frontend URL).
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        
        // Specify the allowed HTTP methods.
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Allow all headers.
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow credentials (e.g., cookies, authorization headers).
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths in the application.
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}