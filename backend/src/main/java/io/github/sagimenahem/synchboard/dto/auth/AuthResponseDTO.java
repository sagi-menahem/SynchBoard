package io.github.sagimenahem.synchboard.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for authentication response containing JWT token. Returned to clients after
 * successful login or email verification to provide authentication credentials for subsequent API
 * requests.
 * 
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    /** JWT token for authenticated session management */
    private String token;
}
