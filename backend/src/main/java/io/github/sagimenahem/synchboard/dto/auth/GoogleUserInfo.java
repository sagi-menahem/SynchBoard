package io.github.sagimenahem.synchboard.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object containing Google user information extracted from OAuth2 authentication or
 * Google One Tap ID Token. This DTO provides a unified structure for processing Google user data
 * regardless of the authentication flow used.
 *
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserInfo {

    /**
     * User's email address from Google account. This serves as the primary identifier for the user
     * in the SynchBoard system.
     */
    private String email;

    /**
     * Google's unique user identifier (the "sub" claim in the ID Token). Used to link the Google
     * account to the SynchBoard user for future authentication.
     */
    private String providerId;

    /**
     * User's full name from Google profile. May be split into first and last name during user
     * creation.
     */
    private String name;

    /**
     * URL of the user's Google profile picture. The image is downloaded and stored locally during
     * user creation or account merging.
     */
    private String pictureUrl;
}
