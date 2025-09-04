package io.github.sagimenahem.synchboard.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing user theme preferences. Contains the user's selected theme
 * setting for the application with validation to ensure only supported themes are used.
 * 
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemePreferencesDTO {

    /** User's preferred theme - must be "light" or "dark" (required, validated pattern) */
    @NotBlank(message = "validation.theme")
    @Pattern(regexp = "^(light|dark)$", message = "validation.themePattern")
    private String theme;
}
