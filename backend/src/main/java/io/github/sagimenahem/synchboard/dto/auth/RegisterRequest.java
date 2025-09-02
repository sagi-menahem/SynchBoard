package io.github.sagimenahem.synchboard.dto.auth;

import java.time.LocalDate;
import io.github.sagimenahem.synchboard.validation.ValidEmail;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @ValidEmail
    private String email;

    @NotBlank(message = "validation.password")
    private String password;

    @NotBlank(message = "validation.firstName")
    private String firstName;

    private String lastName;

    @NotBlank(message = "validation.genderRequired")
    @Pattern(regexp = "^(male|female)$", message = "validation.genderPattern")
    private String gender;

    private String phoneNumber;

    private LocalDate dateOfBirth;
}
