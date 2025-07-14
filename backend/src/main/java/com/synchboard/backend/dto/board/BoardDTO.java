// File: backend/src/main/java/com/synchboard/backend/dto/board/BoardDTO.java
package com.synchboard.backend.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDTO {

    private Long id;

    private String name;

    private String description;

    private String pictureUrl;

    private LocalDateTime lastModifiedDate;

    private Boolean isAdmin;
}