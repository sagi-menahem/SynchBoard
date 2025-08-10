package io.github.sagimenahem.synchboard.dto.user;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.ERROR_PASSWORD_CANT_BE_EMPTY;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordDTO {

    @NotEmpty(message = ERROR_PASSWORD_CANT_BE_EMPTY)
    private String currentPassword;

    @NotEmpty(message = ERROR_PASSWORD_CANT_BE_EMPTY)
    private String newPassword;
}
