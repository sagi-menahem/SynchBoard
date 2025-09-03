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
public class LanguagePreferencesDTO {

    @NotBlank(message = "validation.language")
    @Pattern(regexp = "^(en|he)$", message = "validation.languagePattern")
    private String preferredLanguage;
}
