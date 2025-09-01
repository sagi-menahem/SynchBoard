package io.github.sagimenahem.synchboard.config.websocket;

import static io.github.sagimenahem.synchboard.constants.SecurityConstants.AUTHORIZATION;
import static io.github.sagimenahem.synchboard.constants.SecurityConstants.JWT_PREFIX;
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
import io.github.sagimenahem.synchboard.service.auth.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.debug("Processing WebSocket CONNECT command");
            String authHeader = accessor.getFirstNativeHeader(AUTHORIZATION);

            if (authHeader != null && authHeader.startsWith(JWT_PREFIX)) {
                String jwt = authHeader.substring(7);
                String userEmail = jwtService.extractUsername(jwt);
                log.debug("WebSocket authentication attempt for user: {}", userEmail);

                if (userEmail != null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null,
                                        userDetails.getAuthorities());
                        accessor.setUser(authToken);
                        log.info("WebSocket connection authenticated for user: {}", userEmail);
                    } else {
                        log.warn("WebSocket authentication failed - invalid JWT for user: {}",
                                userEmail);
                    }
                } else {
                    log.warn(
                            "WebSocket authentication failed - unable to extract user email from JWT");
                }
            } else {
                log.warn(
                        "WebSocket authentication failed - missing or invalid authorization header");
            }
        }
        return message;
    }
}
