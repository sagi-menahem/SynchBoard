// File: backend/src/main/java/com/synchboard/backend/dto/board/MemberDTO.java
package com.synchboard.backend.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberDTO {
    private String email;
    private String firstName;
    private String lastName;
    private String profilePictureUrl;
    private Boolean isAdmin;
}
