package io.github.sagimenahem.synchboard.dto.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for feature configuration response.
 * Contains boolean flags indicating which optional features are enabled.
 * 
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureConfigResponseDTO {
    
    /**
     * Indicates whether email verification is enabled.
     * Depends on SendGrid API key being configured.
     */
    private boolean emailVerificationEnabled;
    
    /**
     * Indicates whether password reset functionality is enabled.
     * Depends on SendGrid API key being configured.
     */
    private boolean passwordResetEnabled;
    
    /**
     * Indicates whether Google OAuth login is enabled.
     * Depends on Google Client ID being configured.
     */
    private boolean googleLoginEnabled;
}