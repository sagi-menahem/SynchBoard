package io.github.sagimenahem.synchboard.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

/**
 * OAuth2 configuration that is only active when Google Client ID is provided. This prevents Spring
 * Boot from trying to validate empty OAuth2 credentials.
 *
 * @author Sagi Menahem
 */
@Configuration
@ConditionalOnExpression("!'${GOOGLE_CLIENT_ID:}'.isEmpty()")
public class OAuth2Config {

    @Value("${GOOGLE_CLIENT_ID}")
    private String googleClientId;

    @Value("${GOOGLE_CLIENT_SECRET}")
    private String googleClientSecret;

    @Value("${GOOGLE_REDIRECT_URI:http://localhost:8080/login/oauth2/code/google}")
    private String googleRedirectUri;

    /**
     * Creates the client registration repository for OAuth2 authentication. Provides an in-memory
     * repository containing the Google OAuth2 client registration, enabling Spring Security to
     * handle OAuth2 login flows.
     *
     * @return configured in-memory client registration repository with Google provider
     */
    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(googleClientRegistration());
    }

    /**
     * Builds the Google OAuth2 client registration with configured credentials and endpoints.
     * Configures authorization code grant flow with email and profile scopes, using Google's
     * OAuth2 endpoints for authentication, token exchange, and user info retrieval.
     *
     * @return configured Google client registration for OAuth2 authentication
     */
    private ClientRegistration googleClientRegistration() {
        return ClientRegistration.withRegistrationId("google")
            .clientId(googleClientId)
            .clientSecret(googleClientSecret)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri(googleRedirectUri)
            .scope("email", "profile")
            .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth?prompt=select_account%20consent")
            .tokenUri("https://oauth2.googleapis.com/token")
            .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
            .userNameAttributeName("sub")
            .clientName("Google")
            .build();
    }
}
