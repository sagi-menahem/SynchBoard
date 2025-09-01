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

    @Pattern(regexp = "^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$", message = "validation.canvasColorPattern")
    private String canvasBackgroundColor;

    @Min(value = 400, message = "validation.canvasWidthMin")
    @Max(value = 4000, message = "validation.canvasWidthMax")
    private Integer canvasWidth;

    @Min(value = 300, message = "validation.canvasHeightMin")
    @Max(value = 4000, message = "validation.canvasHeightMax")
    private Integer canvasHeight;
}