package io.github.sagimenahem.synchboard.config.email;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.UserCredentials;
import java.io.IOException;
import java.security.GeneralSecurityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Gmail REST API client. Sets up OAuth2 authentication using refresh token
 * flow for sending emails via the Gmail API.
 *
 * @author Sagi Menahem
 */
@Slf4j
@Configuration
public class GmailApiConfig {

    /**
     * Gmail OAuth2 Client ID from Google Cloud Console
     */
    @Value("${GMAIL_CLIENT_ID:}")
    private String clientId;

    /**
     * Gmail OAuth2 Client Secret from Google Cloud Console
     */
    @Value("${GMAIL_CLIENT_SECRET:}")
    private String clientSecret;

    /**
     * Gmail OAuth2 Refresh Token (long-lived token for offline access)
     */
    @Value("${GMAIL_REFRESH_TOKEN:}")
    private String refreshToken;

    /**
     * Application name for Gmail API requests
     */
    private static final String APPLICATION_NAME = "SynchBoard";

    /**
     * Creates a Gmail API client bean configured with OAuth2 credentials. Returns null if Gmail
     * credentials are not configured, allowing graceful degradation when email is disabled.
     *
     * @return Gmail client instance or null if credentials are missing
     */
    @Bean
    public Gmail gmail() {
        if (!isGmailConfigured()) {
            log.warn(
                "Gmail API credentials not configured. Email functionality will be disabled. "
                    + "Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN to enable."
            );
            return null;
        }

        try {
            NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            GoogleCredentials credentials = buildCredentials();
            HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);

            Gmail gmailClient = new Gmail.Builder(httpTransport, GsonFactory.getDefaultInstance(), requestInitializer)
                .setApplicationName(APPLICATION_NAME)
                .build();

            log.info("Gmail API client initialized successfully");
            return gmailClient;
        } catch (GeneralSecurityException | IOException e) {
            log.error("Failed to initialize Gmail API client: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Builds Google OAuth2 credentials using the refresh token flow.
     *
     * @return GoogleCredentials configured for Gmail API access
     * @throws IOException if credential creation fails
     */
    private GoogleCredentials buildCredentials() throws IOException {
        UserCredentials credentials = UserCredentials.newBuilder()
            .setClientId(clientId)
            .setClientSecret(clientSecret)
            .setRefreshToken(refreshToken)
            .build();

        // Refresh to get initial access token
        credentials.refreshIfExpired();

        return credentials;
    }

    /**
     * Checks if all required Gmail API credentials are configured.
     *
     * @return true if all credentials are present and non-empty
     */
    private boolean isGmailConfigured() {
        return isNotEmpty(clientId) && isNotEmpty(clientSecret) && isNotEmpty(refreshToken);
    }

    /**
     * Helper method to check if a string is not null and not empty.
     *
     * @param value the string to check
     * @return true if the string is not null and not empty after trimming
     */
    private boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
