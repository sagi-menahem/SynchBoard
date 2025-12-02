package io.github.sagimenahem.synchboard.dto.board;

import lombok.Data;

/**
 * Data Transfer Object for updating a board's description. Allows modification of the board's
 * descriptive text, which can be set to null to remove the description.
 *
 * @author Sagi Menahem
 */
@Data
public class UpdateBoardDescriptionRequest {

    /** New description for the board (optional, can be null to clear) */
    private String description;
}
