// File: backend/src/main/java/com/synchboard/backend/config/websocket/WebSocketConfig.java

package com.synchboard.backend.config.websocket;

import lombok.RequiredArgsConstructor; // 1. Add this import
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration; // 1. Import ChannelRegistration
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor // 2. Use Lombok for constructor injection
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // 2. Inject the interceptor via constructor
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

    /**
     * 4. Register our custom interceptor to secure the inbound channel.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }
}