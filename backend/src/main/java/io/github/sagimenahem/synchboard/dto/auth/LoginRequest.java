package io.github.sagimenahem.synchboard.dto.auth;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.ERROR_PASSWORD_CANT_BE_EMPTY;

import io.github.sagimenahem.synchboard.validation.ValidEmail;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for user login requests. Contains email and password credentials with
 * validation constraints for secure user authentication.
 *
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @ValidEmail
    private String email;

    @NotEmpty(message = ERROR_PASSWORD_CANT_BE_EMPTY)
    private String password;
}
