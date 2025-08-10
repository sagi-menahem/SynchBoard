package io.github.sagimenahem.synchboard.dto.board;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.BOARD_NAME_CANT_BE_EMPTY;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.BOARD_NAME_LENGHT;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateBoardNameRequest {

    @NotBlank(message = BOARD_NAME_CANT_BE_EMPTY)
    @Size(min = 3, max = 100, message = BOARD_NAME_LENGHT)
    private String name;
}
