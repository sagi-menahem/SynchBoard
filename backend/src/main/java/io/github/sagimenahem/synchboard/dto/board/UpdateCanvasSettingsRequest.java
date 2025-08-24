package io.github.sagimenahem.synchboard.dto.board;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCanvasSettingsRequest {

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Canvas background color must be a valid hex color")
    private String canvasBackgroundColor;

    @Min(value = 400, message = "Canvas width must be at least 400 pixels")
    @Max(value = 3000, message = "Canvas width must not exceed 3000 pixels")
    private Integer canvasWidth;

    @Min(value = 300, message = "Canvas height must be at least 300 pixels")
    @Max(value = 2000, message = "Canvas height must not exceed 2000 pixels")
    private Integer canvasHeight;
}