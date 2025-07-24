// File: backend/src/main/java/com/synchboard/backend/dto/websocket/BoardUpdateDTO.java
package com.synchboard.backend.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardUpdateDTO {

    private UpdateType updateType;
    private String sourceUserEmail;

    public enum UpdateType {

        DETAILS_UPDATED,

        MEMBERS_UPDATED
    }
}