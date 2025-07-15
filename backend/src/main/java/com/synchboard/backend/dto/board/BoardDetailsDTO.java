// File: backend/src/main/java/com/synchboard/backend/dto/board/BoardDetailsDTO.java
package com.synchboard.backend.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDetailsDTO {
    private Long id;
    private String name;
    private String description;
    private String pictureUrl;
    private List<MemberDTO> members;
}