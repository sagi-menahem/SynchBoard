package io.github.sagimenahem.synchboard.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {

    @NotBlank(message = "validation.firstName")
    private String firstName;

    private String lastName;

    @NotBlank(message = "validation.genderRequired")
    @Pattern(regexp = "^(male|female)$", message = "validation.genderPattern")
    private String gender;

    private String phoneNumber;

    private LocalDate dateOfBirth;
}
