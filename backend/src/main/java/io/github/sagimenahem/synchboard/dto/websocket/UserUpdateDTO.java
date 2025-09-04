package io.github.sagimenahem.synchboard.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for user-specific update WebSocket notifications. Used to notify individual
 * users about changes that affect their personal board access or require UI updates on their
 * client.
 * 
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {

    /** Type of update that affects the user's interface or data */
    private UpdateType updateType;

    /** Enumeration of possible user update types */
    public enum UpdateType {
        /** User's board list needs to be refreshed (new access granted/revoked) */
        BOARD_LIST_CHANGED,

        /** Board details visible to the user have changed */
        BOARD_DETAILS_CHANGED,
    }
}
