package io.github.sagimenahem.synchboard.dto.auth;

import java.time.LocalDate;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(male|female)$", message = "Gender must be 'male' or 'female'")
    private String gender;

    private String phoneNumber;

    private LocalDate dateOfBirth;
}
