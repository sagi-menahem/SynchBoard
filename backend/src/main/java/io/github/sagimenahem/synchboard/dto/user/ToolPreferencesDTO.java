package io.github.sagimenahem.synchboard.dto.user;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.DEFAULT_STROKE_WIDTH_MAX;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.DEFAULT_STROKE_WIDTH_MIN;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class ToolPreferencesDTO {

        @NotBlank(message = "validation.toolRequired")
        @Pattern(regexp = "brush|eraser|square|rectangle|circle|triangle|pentagon|hexagon|star|line|dottedLine|arrow|text|colorPicker|recolor",
                        message = "validation.toolPattern")
        private String defaultTool;

        @NotBlank(message = "validation.strokeColorRequired")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "validation.strokeColorPattern")
        private String defaultStrokeColor;

        @Min(value = DEFAULT_STROKE_WIDTH_MIN, message = "validation.strokeWidthMin")
        @Max(value = DEFAULT_STROKE_WIDTH_MAX, message = "validation.strokeWidthMax")
        private Integer defaultStrokeWidth;
}
