package io.github.sagimenahem.synchboard.config.security;

import static io.github.sagimenahem.synchboard.constants.SecurityConstants.AUTHORIZATION;
import static io.github.sagimenahem.synchboard.constants.SecurityConstants.JWT_PREFIX;
import static io.github.sagimenahem.synchboard.constants.SecurityConstants.JWT_PREFIX_LENGTH;

import io.github.sagimenahem.synchboard.service.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * JWT authentication filter that processes JWT tokens from HTTP requests. Extends
 * OncePerRequestFilter to ensure it executes once per request. Extracts JWT tokens from
 * Authorization headers and sets up Spring Security context.
 *
 * @author Sagi Menahem
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    /** Service for JWT token operations */
    private final JwtService jwtService;
    /** Service for loading user details */
    private final UserDetailsService userDetailsService;

    /**
     * Processes each HTTP request to extract and validate JWT tokens. If a valid JWT token is
     * found, sets up the security context with user authentication.
     *
     * @param request The HTTP servlet request
     * @param response The HTTP servlet response
     * @param filterChain The filter chain to continue processing
     * @throws ServletException if servlet processing fails
     * @throws IOException if I/O processing fails
     */
    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader(AUTHORIZATION);
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith(JWT_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(JWT_PREFIX_LENGTH);
        userEmail = jwtService.extractUsername(jwt);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
