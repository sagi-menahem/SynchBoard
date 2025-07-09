// File: backend/src/main/java/com/synchboard/backend/dto/board/BoardResponse.java

package com.synchboard.backend.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for sending board information in a response to the client.
 * This represents the data needed for a board list item.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardResponse {

    private Long id;
    private String name;
    private String description;
    private String pictureUrl;
    private LocalDateTime lastModifiedDate;
    private Boolean isAdmin;
}