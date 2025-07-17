// File: backend/src/main/java/com/synchboard/backend/dto/board/UpdateBoardNameRequest.java
package com.synchboard.backend.dto.board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import static com.synchboard.backend.config.ApplicationConstants.*;

@Data
public class UpdateBoardNameRequest {

    @NotBlank(message = BOARD_NAME_CANT_BE_EMPTY)
    @Size(min = 3, max = 100, message = BOARD_NAME_LENGHT)
    private String name;
}