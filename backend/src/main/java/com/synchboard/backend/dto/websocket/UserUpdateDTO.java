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

    /**
     * Defines the type of update relevant to a specific user.
     */
    public enum UpdateType {
        /**
         * Indicates that the user's list of boards has changed.
         * (e.g., they were added to a new board, removed from one, or a board was
         * renamed/deleted).
         */
        BOARD_LIST_CHANGED
    }
}