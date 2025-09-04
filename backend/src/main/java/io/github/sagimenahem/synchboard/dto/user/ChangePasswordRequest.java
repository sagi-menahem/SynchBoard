package io.github.sagimenahem.synchboard.dto.user;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for password change requests. Contains current and new password fields with
 * validation to ensure both passwords are provided for secure password updates.
 * 
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    /** User's current password for verification (required) */
    @NotEmpty(message = "validation.password")
    private String currentPassword;

    /** New password to set (required) */
    @NotEmpty(message = "validation.newPassword")
    private String newPassword;
}
