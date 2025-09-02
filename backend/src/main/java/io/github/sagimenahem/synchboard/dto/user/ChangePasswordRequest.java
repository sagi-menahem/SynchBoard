package io.github.sagimenahem.synchboard.dto.user;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    @NotEmpty(message = "validation.password")
    private String currentPassword;

    @NotEmpty(message = "validation.newPassword")
    private String newPassword;
}
