package io.github.sagimenahem.synchboard.config.security;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.API_AUTH_PATH_PATTERN;
import static io.github.sagimenahem.synchboard.constants.ApiConstants.API_USER_PATH_PATTERN;
import static io.github.sagimenahem.synchboard.constants.ApiConstants.IMAGES_PATH_PATTERN;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.WEBSOCKET_ENDPOINT_WITH_SUBPATHS;

import io.github.sagimenahem.synchboard.config.AppProperties;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

/**
 * Spring Security configuration for the SynchBoard application. Configures JWT-based
 * authentication, OAuth2 integration, CORS policies, and security filters for protecting API
 * endpoints and WebSocket connections.
 *
 * @author Sagi Menahem
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final AppProperties appProperties;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final OAuth2FailureHandler oAuth2FailureHandler;

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    /**
     * Configures the security filter chain with JWT authentication, OAuth2 integration, and CORS.
     * Defines public endpoints (auth, WebSocket, images, config) and protected endpoints requiring
     * authentication. Uses stateless session management and conditionally enables OAuth2 login
     * when Google credentials are configured.
     *
     * @param http the HTTP security configuration builder
     * @return the configured security filter chain
     * @throws Exception if security configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors((cors) -> cors.configurationSource(corsConfigurationSource()))
            .csrf((csrf) -> csrf.disable())
            // Disable Spring Security's default headers - Nginx handles these in production
            // This prevents duplicate headers (X-Frame-Options, X-Content-Type-Options, etc.)
            .headers((headers) -> headers.disable())
            .authorizeHttpRequests((auth) ->
                auth
                    .requestMatchers(API_AUTH_PATH_PATTERN)
                    .permitAll()
                    .requestMatchers(WEBSOCKET_ENDPOINT_WITH_SUBPATHS)
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, IMAGES_PATH_PATTERN)
                    .permitAll()
                    .requestMatchers("/login/oauth2/**", "/oauth2/**")
                    .permitAll()
                    .requestMatchers("/api/config/**")
                    .permitAll()
                    .requestMatchers(API_USER_PATH_PATTERN)
                    .authenticated()
                    .anyRequest()
                    .authenticated()
            )
            .sessionManagement((session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // Conditionally enable OAuth2 if Google Client ID is configured
        if (googleClientId != null && !googleClientId.trim().isEmpty()) {
            http.oauth2Login((oauth2) ->
                oauth2.successHandler(oAuth2SuccessHandler).failureHandler(oAuth2FailureHandler)
            );
        }

        return http.build();
    }

    /**
     * Creates the CORS configuration source with allowed origins, methods, and headers. Configures
     * cross-origin requests based on application properties, permitting credentials and standard
     * HTTP methods (GET, POST, PUT, DELETE, OPTIONS) for all endpoints.
     *
     * @return URL-based CORS configuration source applied to all request paths
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(appProperties.getSecurity().getAllowedOrigins()));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
