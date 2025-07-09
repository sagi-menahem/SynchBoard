// File: backend/src/main/java/com/synchboard/backend/dto/board/CreateBoardRequest.java

package com.synchboard.backend.dto.board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for handling new board creation requests from the client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoardRequest {

    @NotBlank(message = "Board name cannot be empty.")
    @Size(min = 3, max = 100, message = "Board name must be between 3 and 100 characters.")
    private String name;

    private String description;
}