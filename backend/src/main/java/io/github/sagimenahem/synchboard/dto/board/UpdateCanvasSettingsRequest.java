package io.github.sagimenahem.synchboard.dto.board;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.CANVAS_HEIGHT_MAX;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.CANVAS_HEIGHT_MIN;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.CANVAS_WIDTH_MAX;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.CANVAS_WIDTH_MIN;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for updating canvas settings of a board. Contains canvas configuration
 * including background color and dimensions with validation constraints to ensure proper canvas
 * setup.
 * 
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCanvasSettingsRequest {

    /** Hexadecimal color code for the canvas background (must match hex pattern) */
    @Pattern(regexp = "^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$",
            message = "validation.canvasColorPattern")
    private String canvasBackgroundColor;

    /** Width of the canvas in pixels (validated range) */
    @Min(value = CANVAS_WIDTH_MIN, message = "validation.canvasWidthMin")
    @Max(value = CANVAS_WIDTH_MAX, message = "validation.canvasWidthMax")
    private Integer canvasWidth;

    /** Height of the canvas in pixels (validated range) */
    @Min(value = CANVAS_HEIGHT_MIN, message = "validation.canvasHeightMin")
    @Max(value = CANVAS_HEIGHT_MAX, message = "validation.canvasHeightMax")
    private Integer canvasHeight;
}
