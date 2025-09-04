package io.github.sagimenahem.synchboard.dto.board;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.*;

import jakarta.validation.constraints.*;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoardRequest {

    @NotBlank(message = BOARD_NAME_CANT_BE_EMPTY)
    @Size(min = BOARD_NAME_MIN_LENGTH, max = BOARD_NAME_MAX_LENGTH, message = BOARD_NAME_LENGTH)
    private String name;

    private String description;

    private MultipartFile picture;

    private List<String> inviteEmails;

    @Pattern(regexp = "^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$", message = "validation.canvasColorPattern")
    private String canvasBackgroundColor;

    @Min(value = CANVAS_WIDTH_MIN, message = "validation.canvasWidthMin")
    @Max(value = CANVAS_WIDTH_MAX, message = "validation.canvasWidthMax")
    private Integer canvasWidth;

    @Min(value = CANVAS_HEIGHT_MIN, message = "validation.canvasHeightMin")
    @Max(value = CANVAS_HEIGHT_MAX, message = "validation.canvasHeightMax")
    private Integer canvasHeight;
}
