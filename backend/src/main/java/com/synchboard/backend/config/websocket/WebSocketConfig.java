// File: backend/src/main/java/com/synchboard/backend/config/websocket/WebSocketConfig.java

package com.synchboard.backend.config.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration; // 1. Add this import

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

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableStompBrokerRelay("/topic")
                .setRelayHost(brokerHost)
                .setRelayPort(brokerPort)
                .setClientLogin(brokerUser)
                .setClientPasscode(brokerPassword)
                .setSystemLogin(brokerUser)
                .setSystemPasscode(brokerPassword);
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }

    /**
     * 2. Add this new method to increase message size limits.
     */
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        // Default is 64KB (64 * 1024). We increase it to 512KB.
        registration.setMessageSizeLimit(512 * 1024);
        registration.setSendBufferSizeLimit(512 * 1024);
    }
}