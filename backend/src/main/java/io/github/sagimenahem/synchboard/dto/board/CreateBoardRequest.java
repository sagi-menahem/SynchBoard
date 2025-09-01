package io.github.sagimenahem.synchboard.dto.board;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.BOARD_NAME_CANT_BE_EMPTY;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.BOARD_NAME_LENGHT;
import java.util.List;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoardRequest {

    @NotBlank(message = BOARD_NAME_CANT_BE_EMPTY)
    @Size(min = 3, max = 100, message = BOARD_NAME_LENGHT)
    private String name;

    private String description;

    private MultipartFile picture;

    private List<String> inviteEmails;

    @Pattern(regexp = "^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$", message = "validation.canvasColorPattern")
    private String canvasBackgroundColor;

    @Min(value = 400, message = "validation.canvasWidthMin")
    @Max(value = 4000, message = "validation.canvasWidthMax")
    private Integer canvasWidth;

    @Min(value = 300, message = "validation.canvasHeightMin")
    @Max(value = 4000, message = "validation.canvasHeightMax")
    private Integer canvasHeight;
}
