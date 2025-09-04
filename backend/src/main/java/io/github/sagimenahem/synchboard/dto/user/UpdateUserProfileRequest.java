package io.github.sagimenahem.synchboard.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for updating user profile information. Contains personal details with
 * validation constraints to ensure proper data format and required field completion.
 * 
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {

    /** User's first name (required) */
    @NotBlank(message = "validation.firstName")
    private String firstName;

    /** User's last name (optional) */
    private String lastName;

    /** User's gender - must be "male" or "female" (required, validated pattern) */
    @NotBlank(message = "validation.genderRequired")
    @Pattern(regexp = "^(male|female)$", message = "validation.genderPattern")
    private String gender;

    /** User's phone number (optional) */
    private String phoneNumber;

    /** User's date of birth (optional) */
    private LocalDate dateOfBirth;
}
