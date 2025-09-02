package io.github.sagimenahem.synchboard.dto.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanvasPreferencesDTO {

    @Min(value = CANVAS_CHAT_SPLIT_RATIO_MIN, message = "Canvas chat split ratio must be at least 30%")
    @Max(value = CANVAS_CHAT_SPLIT_RATIO_MAX, message = "Canvas chat split ratio must not exceed 70%")
    private Integer canvasChatSplitRatio;
}