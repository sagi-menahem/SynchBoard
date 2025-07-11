// File: backend/src/main/java/com/synchboard/backend/dto/board/CreateBoardRequest.java
package com.synchboard.backend.dto.board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * DTO for creating a new board.
 * Contains the initial details for a new board.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoardRequest {

    /**
     * The name for the new board. Must not be blank and be between 3 and 100
     * characters.
     */
    @NotBlank(message = BOARD_NAME_CANT_BE_EMPTY)
    @Size(min = 3, max = 100, message = BOARD_NAME_LENGHT)
    private String name;

    /**
     * An optional description for the new board.
     */
    private String description;
}