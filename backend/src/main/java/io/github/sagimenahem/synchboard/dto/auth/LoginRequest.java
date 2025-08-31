package io.github.sagimenahem.synchboard.dto.auth;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.ERROR_PASSWORD_CANT_BE_EMPTY;
import jakarta.validation.constraints.NotEmpty;
import io.github.sagimenahem.synchboard.validation.ValidEmail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
