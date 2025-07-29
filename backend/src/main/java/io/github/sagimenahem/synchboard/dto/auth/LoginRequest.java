// File: backend/src/main/java/io/github/sagimenahem/synchboard/dto/auth/LoginRequest.java
package io.github.sagimenahem.synchboard.dto.auth;

import static io.github.sagimenahem.synchboard.config.constants.MessageConstants.ERROR_EMAIL_CANT_BE_EMPTY;
import static io.github.sagimenahem.synchboard.config.constants.MessageConstants.ERROR_EMAIL_SHOULD_BE_VALID;
import static io.github.sagimenahem.synchboard.config.constants.MessageConstants.ERROR_PASSWORD_CANT_BE_EMPTY;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotEmpty(message = ERROR_EMAIL_CANT_BE_EMPTY)
    @Email(message = ERROR_EMAIL_SHOULD_BE_VALID)
    private String email;

    @NotEmpty(message = ERROR_PASSWORD_CANT_BE_EMPTY)
    private String password;
}
