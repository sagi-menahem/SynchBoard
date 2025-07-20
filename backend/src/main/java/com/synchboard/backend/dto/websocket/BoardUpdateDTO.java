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

    /**
     * Defines the type of update that occurred on the board.
     */
    public enum UpdateType {
        /**
         * Indicates a change in the board's core details like name, description, or
         * picture.
         */
        DETAILS_UPDATED,

        /**
         * Indicates a change in the board's membership, such as a user joining,
         * leaving,
         * being removed, or being promoted.
         */
        MEMBERS_UPDATED
    }
}