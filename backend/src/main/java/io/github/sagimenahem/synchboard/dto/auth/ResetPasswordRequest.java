package io.github.sagimenahem.synchboard.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for password reset requests. Contains user email, reset code, and new
 * password for completing the password reset process with proper validation.
 * 
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    /** The email address of the user resetting password */
    @NotBlank(message = "validation.email")
    @Email(message = "validation.emailValid")
    private String email;

    /** The 6-digit reset code sent to the user's email */
    @NotBlank(message = "validation.resetCode")
    @Pattern(regexp = "^\\d{6}$", message = "validation.resetCodeDigits")
    private String resetCode;

    /** The new password to set for the user account */
    @NotBlank(message = "validation.newPassword")
    private String newPassword;
}
