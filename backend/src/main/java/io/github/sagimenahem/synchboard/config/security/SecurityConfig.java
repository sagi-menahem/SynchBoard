// File: backend/src/main/java/io/github/sagimenahem/synchboard/config/security/SecurityConfig.java
package io.github.sagimenahem.synchboard.config.security;

import static io.github.sagimenahem.synchboard.config.constants.ApiConstants.API_AUTH_PATH_PATTERN;
import static io.github.sagimenahem.synchboard.config.constants.ApiConstants.API_USER_PATH_PATTERN;
import static io.github.sagimenahem.synchboard.config.constants.ApiConstants.IMAGES_PATH_PATTERN;
import static io.github.sagimenahem.synchboard.config.constants.SecurityConstants.CLIENT_ORIGIN_URL;
import static io.github.sagimenahem.synchboard.config.constants.WebSocketConstants.WEBSOCKET_ENDPOINT_WITH_SUBPATHS;
import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.requestMatchers(API_AUTH_PATH_PATTERN)
                        .permitAll().requestMatchers(WEBSOCKET_ENDPOINT_WITH_SUBPATHS).permitAll()
                        .requestMatchers(HttpMethod.GET, IMAGES_PATH_PATTERN).permitAll()
                        .requestMatchers(API_USER_PATH_PATTERN).authenticated().anyRequest()
                        .authenticated())
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(CLIENT_ORIGIN_URL));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
