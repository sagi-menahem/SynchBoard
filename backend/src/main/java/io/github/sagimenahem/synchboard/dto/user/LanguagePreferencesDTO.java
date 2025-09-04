package io.github.sagimenahem.synchboard.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing user language preferences. Contains the user's preferred
 * language setting for the application with validation to ensure only supported languages are used.
 * 
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LanguagePreferencesDTO {

    /**
     * User's preferred language - must be "en" (English) or "he" (Hebrew) (required, validated
     * pattern)
     */
    @NotBlank(message = "validation.language")
    @Pattern(regexp = "^(en|he)$", message = "validation.languagePattern")
    private String preferredLanguage;
}
