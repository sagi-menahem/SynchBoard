package io.github.sagimenahem.synchboard.dto.auth;

import io.github.sagimenahem.synchboard.validation.ValidEmail;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import lombok.Data;

/**
 * Data Transfer Object for user registration requests. Contains user information and validation
 * constraints for creating new accounts with comprehensive field validation for security and data
 * integrity.
 *
 * @author Sagi Menahem
 */
@Data
public class RegisterRequest {

    @ValidEmail
    private String email;

    @NotBlank(message = "validation.password")
    @jakarta.validation.constraints.Size(min = 6, message = "validation.passwordMinLength")
    private String password;

    @NotBlank(message = "validation.firstName")
    private String firstName;

    private String lastName;

    @Pattern(regexp = "^(male|female)?$", message = "validation.genderPattern")
    private String gender;

    private String phoneNumber;

    private LocalDate dateOfBirth;
}
