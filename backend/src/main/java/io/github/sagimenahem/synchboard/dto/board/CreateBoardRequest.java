// File: backend/src/main/java/io/github/sagimenahem/synchboard/dto/board/CreateBoardRequest.java
package io.github.sagimenahem.synchboard.dto.board;

import static io.github.sagimenahem.synchboard.config.constants.MessageConstants.BOARD_NAME_CANT_BE_EMPTY;
import static io.github.sagimenahem.synchboard.config.constants.MessageConstants.BOARD_NAME_LENGHT;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoardRequest {

    @NotBlank(message = BOARD_NAME_CANT_BE_EMPTY)
    @Size(min = 3, max = 100, message = BOARD_NAME_LENGHT)

    private String name;

    private String description;
}