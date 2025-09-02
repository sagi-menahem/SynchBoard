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
public class VerifyEmailRequest {

    @NotBlank(message = "validation.email")
    @Email(message = "validation.emailValid")
    private String email;

    @NotBlank(message = "validation.verificationCode")
    @Pattern(regexp = "^\\d{6}$", message = "validation.verificationCodeDigits")
    private String verificationCode;
}
