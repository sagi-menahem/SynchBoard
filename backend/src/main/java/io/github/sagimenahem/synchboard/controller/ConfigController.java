package io.github.sagimenahem.synchboard.controller;

import io.github.sagimenahem.synchboard.dto.config.FeatureConfigResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for providing application feature configuration to the frontend.
 * This allows the UI to conditionally display features based on available backend services.
 *
 * @author Sagi Menahem
 */
@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class ConfigController {

    @Value("${GMAIL_CLIENT_ID:}")
    private String gmailClientId;

    @Value("${GMAIL_CLIENT_SECRET:}")
    private String gmailClientSecret;

    @Value("${GMAIL_REFRESH_TOKEN:}")
    private String gmailRefreshToken;

    @Value("${GMAIL_SENDER_EMAIL:}")
    private String gmailSenderEmail;

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    /**
     * Returns the current feature configuration indicating which optional services are enabled.
     * This endpoint helps the frontend determine which UI components to display.
     *
     * @return FeatureConfigResponseDTO containing the status of optional features
     */
    @GetMapping("/features")
    public FeatureConfigResponseDTO getFeatures() {
        boolean emailEnabled = isGmailConfigured();
        return FeatureConfigResponseDTO.builder()
            .emailVerificationEnabled(emailEnabled)
            .passwordResetEnabled(emailEnabled)
            .googleLoginEnabled(isNotEmpty(googleClientId))
            .build();
    }

    /**
     * Checks if Gmail API is fully configured with all required credentials.
     *
     * @return true if all Gmail API credentials are configured
     */
    private boolean isGmailConfigured() {
        return (
            isNotEmpty(gmailClientId) &&
            isNotEmpty(gmailClientSecret) &&
            isNotEmpty(gmailRefreshToken) &&
            isNotEmpty(gmailSenderEmail)
        );
    }

    /**
     * Checks if a configuration value is not empty.
     *
     * @param value the configuration value to check
     * @return true if the value is not null and not empty/blank, false otherwise
     */
    private boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
