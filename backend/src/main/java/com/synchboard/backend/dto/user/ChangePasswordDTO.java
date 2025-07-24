// File: backend/src/main/java/com/synchboard/backend/dto/user/ChangePasswordDTO.java
package com.synchboard.backend.dto.user;

import static com.synchboard.backend.config.constants.MessageConstants.ERROR_PASSWORD_CANT_BE_EMPTY;
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
