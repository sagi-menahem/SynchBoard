package io.github.sagimenahem.synchboard.dto.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing user canvas preferences. Contains canvas-specific settings and
 * layout preferences with validation constraints for proper canvas configuration.
 * 
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanvasPreferencesDTO {

    /** Canvas to chat split ratio percentage (validated range) */
    @Min(value = 0, message = "validation.canvasSplitMin")
    @Max(value = 100, message = "validation.canvasSplitMax")
    private Integer canvasChatSplitRatio;

    /** Whether the chat panel is open (visible) or collapsed */
    private Boolean isChatOpen;
}
