package io.github.sagimenahem.synchboard.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for board update WebSocket notifications. Used to notify board members about
 * changes to board configuration, membership, or canvas settings through real-time messaging.
 *
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardUpdateDTO {

    /** Type of update that occurred on the board */
    private UpdateType updateType;

    /** Email of the user who made the change */
    private String sourceUserEmail;

    /** Enumeration of possible board update types */
    public enum UpdateType {
        /** Board name, description, or picture was updated */
        DETAILS_UPDATED,

        /** Board membership was modified (members added/removed) */
        MEMBERS_UPDATED,

        /** Canvas settings were changed (background, dimensions) */
        CANVAS_UPDATED,
    }
}
