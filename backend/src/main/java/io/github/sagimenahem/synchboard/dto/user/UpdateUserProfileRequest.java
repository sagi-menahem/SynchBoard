package io.github.sagimenahem.synchboard.dto.user;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {

    @NotBlank(message = "First name cannot be blank")
    private String firstName;

    private String lastName;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(male|female)$", message = "Gender must be 'male' or 'female'")
    private String gender;

    private String phoneNumber;

    private LocalDate dateOfBirth;
}
