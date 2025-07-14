// File: backend/src/main/java/com/synchboard/backend/config/websocket/WebSocketConfig.java
package com.synchboard.backend.config.websocket;

import com.synchboard.backend.config.AppProperties;
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

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;
    private final AppProperties appProperties;

    // Use standard Spring properties for ActiveMQ credentials
    @Value("${spring.activemq.user}")
    private String brokerUser;

    @Value("${spring.activemq.password}")
    private String brokerPassword;

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config.enableStompBrokerRelay(WEBSOCKET_TOPIC_PREFIX)
                // Use the type-safe properties from our AppProperties bean
                .setRelayHost(appProperties.getStomp().getBrokerHost())
                .setRelayPort(appProperties.getStomp().getBrokerPort())
                // Use the standard Spring properties for credentials
                .setClientLogin(brokerUser)
                .setClientPasscode(brokerPassword)
                .setSystemLogin(brokerUser)
                .setSystemPasscode(brokerPassword);
        config.setApplicationDestinationPrefixes(WEBSOCKET_APP_PREFIX);
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint(WEBSOCKET_ENDPOINT)
                .setAllowedOrigins(CLIENT_ORIGIN_URL)
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }

    @Override
    public void configureWebSocketTransport(@NonNull WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(WEBSOCKET_MESSAGE_SIZE_LIMIT);
        registration.setSendBufferSizeLimit(WEBSOCKET_SEND_BUFFER_SIZE_LIMIT);
    }
}