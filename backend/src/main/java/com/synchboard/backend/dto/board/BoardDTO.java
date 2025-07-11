// File: backend/src/main/java/com/synchboard/backend/dto/board/BoardResponse.java
package com.synchboard.backend.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for representing board information sent to the client.
 * Note: The file name is BoardResponse.java, but the class name is BoardDTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDTO {

    /**
     * The unique identifier of the board.
     */
    private Long id;

    /**
     * The name of the board.
     */
    private String name;

    /**
     * A short description of the board.
     */
    private String description;

    /**
     * The URL for the board's picture or avatar.
     */
    private String pictureUrl;

    /**
     * The timestamp of the last modification to the board.
     */
    private LocalDateTime lastModifiedDate;

    /**
     * A flag indicating if the current user is an administrator of this board.
     */
    private Boolean isAdmin;
}