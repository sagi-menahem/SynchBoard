package io.github.sagimenahem.synchboard.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for Google One Tap authentication. Contains the credential (ID Token) returned by
 * Google Identity Services SDK after user authentication.
 *
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleOneTapRequest {

    /**
     * The Google ID Token (JWT) received from Google Identity Services SDK. This token contains the
     * user's identity information and must be verified on the server.
     */
    @NotBlank(message = "Credential is required")
    private String credential;
}
