package io.github.sagimenahem.synchboard.dto.auth;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import io.github.sagimenahem.synchboard.validation.ValidEmail;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @ValidEmail
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
