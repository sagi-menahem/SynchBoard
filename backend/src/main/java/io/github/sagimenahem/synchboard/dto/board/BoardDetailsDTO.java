package io.github.sagimenahem.synchboard.dto.board;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing detailed board information. Contains comprehensive board
 * metadata including member information, visual settings, and canvas configuration for board
 * management screens.
 * 
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDetailsDTO {

    /** Unique identifier for the board */
    private Long id;

    /** Display name of the board */
    private String name;

    /** Optional description of the board */
    private String description;

    /** URL to the board's cover picture */
    private String pictureUrl;

    /** List of members who have access to this board */
    private List<MemberDTO> members;

    /** Hexadecimal color code for the canvas background */
    private String canvasBackgroundColor;

    /** Width of the canvas in pixels */
    private Integer canvasWidth;

    /** Height of the canvas in pixels */
    private Integer canvasHeight;
}
