package io.github.sagimenahem.synchboard.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemePreferencesDTO {

    @NotBlank(message = "Theme preference cannot be blank")
    @Pattern(regexp = "^(light|dark)$",
            message = "Invalid theme preference. Supported themes: light, dark")
    private String theme;
}
