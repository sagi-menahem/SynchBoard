package io.github.sagimenahem.synchboard.config.websocket;

import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.*;
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
import io.github.sagimenahem.synchboard.config.AppProperties;
import lombok.RequiredArgsConstructor;

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

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config.enableStompBrokerRelay(WEBSOCKET_TOPIC_PREFIX)
                .setRelayHost(appProperties.getStomp().getBrokerHost())
                .setRelayPort(appProperties.getStomp().getBrokerPort()).setClientLogin(brokerUser)
                .setClientPasscode(brokerPassword).setSystemLogin(brokerUser)
                .setSystemPasscode(brokerPassword);
        config.setApplicationDestinationPrefixes(WEBSOCKET_APP_PREFIX);
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint(WEBSOCKET_ENDPOINT)
                .setAllowedOrigins(appProperties.getSecurity().getAllowedOrigins())
                .withSockJS()
                .setStreamBytesLimit(1024 * 1024)
                .setHttpMessageCacheSize(1000)
                .setDisconnectDelay(30 * 1000);
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

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(1024 * 1024);
        container.setMaxBinaryMessageBufferSize(1024 * 1024);
        return container;
    }
}
