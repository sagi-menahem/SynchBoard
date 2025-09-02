package io.github.sagimenahem.synchboard.dto.user;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.CANVAS_CHAT_SPLIT_RATIO_MAX;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.CANVAS_CHAT_SPLIT_RATIO_MIN;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanvasPreferencesDTO {

    @Min(value = CANVAS_CHAT_SPLIT_RATIO_MIN,
            message = "validation.canvasSplitMin")
    @Max(value = CANVAS_CHAT_SPLIT_RATIO_MAX,
            message = "validation.canvasSplitMax")
    private Integer canvasChatSplitRatio;
}
