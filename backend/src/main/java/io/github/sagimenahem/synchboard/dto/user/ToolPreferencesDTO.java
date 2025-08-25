package io.github.sagimenahem.synchboard.dto.user;

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

    @NotBlank(message = "Default tool cannot be blank")
    @Pattern(regexp = "brush|eraser|square|rectangle|circle|triangle|pentagon|hexagon|star|line|dottedLine|arrow|text|colorPicker|recolor", 
             message = "Invalid tool type")
    private String defaultTool;

    @NotBlank(message = "Default stroke color cannot be blank")
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Default stroke color must be a valid hex color")
    private String defaultStrokeColor;

    @Min(value = 1, message = "Default stroke width must be at least 1")
    @Max(value = 50, message = "Default stroke width must not exceed 50")
    private Integer defaultStrokeWidth;
}