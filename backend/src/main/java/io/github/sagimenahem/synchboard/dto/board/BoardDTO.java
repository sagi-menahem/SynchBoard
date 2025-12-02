package io.github.sagimenahem.synchboard.dto.board;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing a board in the system. Contains board metadata including
 * identification, display information, canvas configuration, and user access information.
 *
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDTO {

    /** Unique identifier for the board */
    private Long id;

    /** Display name of the board */
    private String name;

    /** Optional description of the board */
    private String description;

    /** URL to the board's cover picture */
    private String pictureUrl;

    /** Timestamp of the last modification to the board */
    private LocalDateTime lastModifiedDate;

    /** Whether the current user has admin privileges on this board */
    private Boolean isAdmin;

    /** Hexadecimal color code for the canvas background */
    private String canvasBackgroundColor;

    /** Width of the canvas in pixels */
    private Integer canvasWidth;

    /** Height of the canvas in pixels */
    private Integer canvasHeight;
}
