// File: backend/src/main/java/com/synchboard/backend/config/security/JwtAuthFilter.java
package com.synchboard.backend.config.security;

import com.synchboard.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * A filter that handles JWT-based authentication for each HTTP request.
 * It extends OncePerRequestFilter to ensure it's executed only once per
 * request.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Processes an incoming HTTP request to check for a valid JWT in the
     * Authorization header.
     * If a valid token is found, it sets the authentication in the security
     * context.
     *
     * @param request     the HTTP request.
     * @param response    the HTTP response.
     * @param filterChain the filter chain.
     * @throws ServletException if a servlet-specific error occurs.
     * @throws IOException      if an I/O error occurs.
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader(AUTHORIZATION);
        final String jwt;
        final String userEmail;

        // If the Authorization header is missing or doesn't start with "Bearer ", pass
        // the request to the next filter.
        if (authHeader == null || !authHeader.startsWith(JWT_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the JWT from the "Bearer " prefix.
        jwt = authHeader.substring(JWT_PREFIX_LENGTH);
        userEmail = jwtService.extractUsername(jwt);

        // If a user email is extracted and there's no existing authentication in the
        // security context.
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // If the token is valid, create an authentication token and set it in the
            // security context.
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // Continue the filter chain.
        filterChain.doFilter(request, response);
    }
}