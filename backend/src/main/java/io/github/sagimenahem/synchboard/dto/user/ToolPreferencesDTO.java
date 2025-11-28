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

/**
 * Data Transfer Object representing user tool preferences. Contains default settings for drawing
 * tools including tool selection, colors, stroke properties, and dock UI preferences with
 * validation constraints.
 *
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolPreferencesDTO {

    /** User's preferred default drawing tool (required, must match allowed tool pattern) */
    @NotBlank(message = "validation.toolRequired")
    @Pattern(
            regexp = "brush|eraser|square|rectangle|circle|triangle|pentagon|hexagon|star|line|dottedLine|arrow|text|colorPicker|recolor",
            message = "validation.toolPattern")
    private String defaultTool;

    /**
     * User's preferred default stroke color in 6-digit hex format (required, validated hex pattern)
     */
    @NotBlank(message = "validation.strokeColorRequired")
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "validation.strokeColorPattern")
    private String defaultStrokeColor;

    /** User's preferred default stroke width in pixels (validated range) */
    @Min(value = DEFAULT_STROKE_WIDTH_MIN, message = "validation.strokeWidthMin")
    @Max(value = DEFAULT_STROKE_WIDTH_MAX, message = "validation.strokeWidthMax")
    private Integer defaultStrokeWidth;

    /** Dock anchor position for floating toolbar placement */
    @Pattern(
            regexp = "top-left|top-center|top-right|bottom-left|bottom-center|bottom-right|left-center|right-center",
            message = "validation.dockAnchorPattern")
    private String dockAnchor;

    /** Whether the floating dock is minimized/collapsed */
    private Boolean isDockMinimized;
}
