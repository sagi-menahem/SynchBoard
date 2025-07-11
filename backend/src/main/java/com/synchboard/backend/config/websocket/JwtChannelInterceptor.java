// File: backend/src/main/java/com/synchboard/backend/config/websocket/JwtChannelInterceptor.java
package com.synchboard.backend.config.websocket;

import com.synchboard.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * Intercepts incoming WebSocket messages to perform JWT authentication.
 * Specifically handles the STOMP CONNECT command to authenticate users before
 * establishing a connection.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Intercepts messages before they are sent to a channel.
     * This method is used to authenticate a user when a WebSocket CONNECT command
     * is received.
     *
     * @param message the message being sent.
     * @param channel the channel to which the message is being sent.
     * @return the message, possibly modified, or null to prevent sending.
     */
    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Check if the message is a STOMP CONNECT command.
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader(AUTHORIZATION);

            if (authHeader != null && authHeader.startsWith(JWT_PREFIX)) {
                String jwt = authHeader.substring(7);
                String userEmail = jwtService.extractUsername(jwt);

                if (userEmail != null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                    // If the token is valid, set the user in the STOMP accessor.
                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        accessor.setUser(authToken);
                    }
                }
            }
        }
        return message;
    }
}