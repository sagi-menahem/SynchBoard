// File: backend/src/main/java/com/synchboard/backend/dto/websocket/UserUpdateDTO.java
package com.synchboard.backend.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {

    private UpdateType updateType;

    public enum UpdateType {

        BOARD_LIST_CHANGED
    }
}