package io.github.sagimenahem.synchboard.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    @NotBlank(message = "validation.email")
    @Email(message = "validation.emailValid")
    private String email;

    @NotBlank(message = "validation.resetCode")
    @Pattern(regexp = "^\\d{6}$", message = "validation.resetCodeDigits")
    private String resetCode;

    @NotBlank(message = "validation.newPassword")
    private String newPassword;
}
