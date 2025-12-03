package io.github.sagimenahem.synchboard.config.websocket;

import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.*;

import io.github.sagimenahem.synchboard.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

/**
 * WebSocket configuration for real-time collaborative features. Configures STOMP broker relay using
 * ActiveMQ, message routing, JWT authentication, and connection settings for real-time board
 * collaboration and chat functionality.
 *
 * @author Sagi Menahem
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;
    private final AppProperties appProperties;

    @Value("${spring.activemq.user}")
    private String brokerUser;

    @Value("${spring.activemq.password}")
    private String brokerPassword;

    /**
     * Configures the STOMP message broker to use external ActiveMQ broker relay. Sets up broker
     * connection parameters, authentication credentials, heartbeat intervals, and application
     * destination prefixes for real-time message routing.
     *
     * @param config the message broker registry to configure
     */
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config
            .enableStompBrokerRelay(WEBSOCKET_TOPIC_PREFIX)
            .setRelayHost(appProperties.getStomp().getBrokerHost())
            .setRelayPort(appProperties.getStomp().getBrokerPort())
            .setClientLogin(brokerUser)
            .setClientPasscode(brokerPassword)
            .setSystemLogin(brokerUser)
            .setSystemPasscode(brokerPassword)
            .setSystemHeartbeatSendInterval(WEBSOCKET_HEARTBEAT_INTERVAL_MS)
            .setSystemHeartbeatReceiveInterval(WEBSOCKET_HEARTBEAT_INTERVAL_MS)
            .setVirtualHost("/");

        config.setApplicationDestinationPrefixes(WEBSOCKET_APP_PREFIX);
    }

    /**
     * Registers STOMP WebSocket endpoint for client connections using native WebSocket. Configures
     * CORS allowed origins for cross-origin WebSocket connections. Native WebSocket is supported by
     * all modern browsers (95%+ coverage) and provides better performance than SockJS fallbacks.
     *
     * @param registry the STOMP endpoint registry to configure
     */
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint(WEBSOCKET_ENDPOINT).setAllowedOrigins(appProperties.getSecurity().getAllowedOrigins());
    }

    /**
     * Configures client inbound channel with JWT authentication interceptor. Adds security layer
     * to validate JWT tokens for all incoming WebSocket messages and ensure authenticated access.
     *
     * @param registration the channel registration to configure with interceptors
     */
    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }

    /**
     * Configures WebSocket transport settings including message size and buffer limits. Sets
     * maximum message size and send buffer limits to prevent excessive memory usage and ensure
     * stable performance under load.
     *
     * @param registration the WebSocket transport registration to configure
     */
    @Override
    public void configureWebSocketTransport(@NonNull WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(WEBSOCKET_MESSAGE_SIZE_LIMIT);
        registration.setSendBufferSizeLimit(WEBSOCKET_SEND_BUFFER_SIZE_LIMIT);
    }

    /**
     * Creates and configures the WebSocket container with message buffer size limits. Establishes
     * maximum buffer sizes for text and binary messages to prevent out-of-memory errors during
     * large message processing.
     *
     * @return configured ServletServerContainerFactoryBean with appropriate buffer limits
     */
    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(1024 * 1024);
        container.setMaxBinaryMessageBufferSize(1024 * 1024);
        return container;
    }
}
