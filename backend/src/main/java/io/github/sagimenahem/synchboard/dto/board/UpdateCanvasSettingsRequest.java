package io.github.sagimenahem.synchboard.dto.board;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCanvasSettingsRequest {

    @Pattern(regexp = "^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$", message = "validation.canvasColorPattern")
    private String canvasBackgroundColor;

    @Min(value = CANVAS_WIDTH_MIN, message = "validation.canvasWidthMin")
    @Max(value = CANVAS_WIDTH_MAX, message = "validation.canvasWidthMax")
    private Integer canvasWidth;

    @Min(value = CANVAS_HEIGHT_MIN, message = "validation.canvasHeightMin")
    @Max(value = CANVAS_HEIGHT_MAX, message = "validation.canvasHeightMax")
    private Integer canvasHeight;
}