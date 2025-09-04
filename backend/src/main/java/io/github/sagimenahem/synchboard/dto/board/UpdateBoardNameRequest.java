package io.github.sagimenahem.synchboard.dto.board;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.BOARD_NAME_CANT_BE_EMPTY;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.BOARD_NAME_LENGTH;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.BOARD_NAME_MAX_LENGTH;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.BOARD_NAME_MIN_LENGTH;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateBoardNameRequest {

    @NotBlank(message = BOARD_NAME_CANT_BE_EMPTY)
    @Size(min = BOARD_NAME_MIN_LENGTH, max = BOARD_NAME_MAX_LENGTH, message = BOARD_NAME_LENGTH)
    private String name;
}
