package io.github.sagimenahem.synchboard.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for email verification requests. Contains user email and verification code
 * for completing the email verification process during registration.
 * 
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyEmailRequest {

    /** The email address being verified */
    @NotBlank(message = "validation.email")
    @Email(message = "validation.emailValid")
    private String email;

    /** The 6-digit verification code sent to the user's email */
    @NotBlank(message = "validation.verificationCode")
    @Pattern(regexp = "^\\d{6}$", message = "validation.verificationCodeDigits")
    private String verificationCode;
}
