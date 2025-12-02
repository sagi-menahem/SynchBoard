package io.github.sagimenahem.synchboard.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for resending email verification code requests. Contains the user's email
 * address to resend verification code for completing the email verification process.
 *
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResendVerificationRequest {

    /** The email address to resend verification code to */
    @NotBlank(message = "validation.email")
    @Email(message = "validation.emailValid")
    private String email;
}
