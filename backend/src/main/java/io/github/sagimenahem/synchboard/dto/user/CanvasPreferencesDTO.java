package io.github.sagimenahem.synchboard.dto.user;

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

    @Min(value = 15, message = "Canvas chat split ratio must be at least 15%")
    @Max(value = 85, message = "Canvas chat split ratio must not exceed 85%")
    private Integer canvasChatSplitRatio;
}