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

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Reset code is required")
    @Pattern(regexp = "^\\d{6}$", message = "Reset code must be exactly 6 digits")
    private String resetCode;

    @NotBlank(message = "New password is required")
    private String newPassword;
}
