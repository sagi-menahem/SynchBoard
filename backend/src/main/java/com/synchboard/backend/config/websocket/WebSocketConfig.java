// File: backend/src/main/java/com/synchboard/backend/config/websocket/WebSocketConfig.java
package com.synchboard.backend.config.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * Configuration for WebSocket and STOMP messaging.
 * Sets up the message broker, registers endpoints, and configures interceptors.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;

    @Value("${spring.activemq.stomp.broker-host}")
    private String brokerHost;
    @Value("${spring.activemq.stomp.broker-port}")
    private int brokerPort;
    @Value("${spring.activemq.user}")
    private String brokerUser;
    @Value("${spring.activemq.password}")
    private String brokerPassword;

    /**
     * Configures the message broker.
     * Uses a STOMP broker relay to connect to an external message broker like
     * ActiveMQ.
     *
     * @param config the message broker registry.
     */
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // Use a STOMP broker relay to connect to an external message broker.
        config.enableStompBrokerRelay(WEBSOCKET_TOPIC_PREFIX)
                .setRelayHost(brokerHost)
                .setRelayPort(brokerPort)
                .setClientLogin(brokerUser)
                .setClientPasscode(brokerPassword)
                .setSystemLogin(brokerUser)
                .setSystemPasscode(brokerPassword);
        // Defines the prefix for messages that are bound for @MessageMapping methods.
        config.setApplicationDestinationPrefixes(WEBSOCKET_APP_PREFIX);
    }

    /**
     * Registers STOMP endpoints, mapping each to a specific URL and enabling SockJS
     * fallback options.
     *
     * @param registry the STOMP endpoint registry.
     */
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint(WEBSOCKET_ENDPOINT)
                .setAllowedOrigins(CLIENT_ORIGIN_URL)
                // Use SockJS for fallback options if WebSocket is not available.
                .withSockJS();
    }

    /**
     * Configures the client inbound channel with a custom interceptor for JWT
     * authentication.
     *
     * @param registration the channel registration.
     */
    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }

    /**
     * Configures WebSocket transport options.
     *
     * @param registration the WebSocket transport registration.
     */
    @Override
    public void configureWebSocketTransport(@NonNull WebSocketTransportRegistration registration) {
        // Increase the message size limits for WebSocket communication.
        registration.setMessageSizeLimit(WEBSOCKET_MESSAGE_SIZE_LIMIT);
        registration.setSendBufferSizeLimit(WEBSOCKET_SEND_BUFFER_SIZE_LIMIT);
    }
}