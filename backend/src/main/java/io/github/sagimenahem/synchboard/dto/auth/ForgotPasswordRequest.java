package io.github.sagimenahem.synchboard.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for forgot password requests. Contains the user's email address for password
 * reset functionality. Validates that the email is not blank and follows proper email format.
 * 
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {

    /** The email address of the user requesting password reset */
    @NotBlank(message = "validation.email")
    @Email(message = "validation.emailValid")
    private String email;
}
