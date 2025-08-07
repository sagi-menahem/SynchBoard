package io.github.sagimenahem.synchboard.dto.board;

import static io.github.sagimenahem.synchboard.config.constants.MessageConstants.ERROR_EMAIL_CANT_BE_EMPTY;
import static io.github.sagimenahem.synchboard.config.constants.MessageConstants.ERROR_EMAIL_SHOULD_BE_VALID;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InviteRequest {

    @NotEmpty(message = ERROR_EMAIL_CANT_BE_EMPTY)
    @Email(message = ERROR_EMAIL_SHOULD_BE_VALID)
    private String email;
}
