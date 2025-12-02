package io.github.sagimenahem.synchboard.dto.board;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.*;

import jakarta.validation.constraints.*;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * Data Transfer Object for board creation requests. Contains all necessary information to create a
 * new board including basic metadata, canvas settings, cover picture, and initial member
 * invitations.
 *
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoardRequest {

    /** Display name of the board to be created (required, length validated) */
    @NotBlank(message = BOARD_NAME_CANT_BE_EMPTY)
    @Size(min = BOARD_NAME_MIN_LENGTH, max = BOARD_NAME_MAX_LENGTH, message = BOARD_NAME_LENGTH)
    private String name;

    /** Optional description of the board */
    private String description;

    /** Optional cover picture file for the board */
    private MultipartFile picture;

    /** List of email addresses to invite as initial board members */
    private List<String> inviteEmails;

    /** Hexadecimal color code for the canvas background (must match hex pattern) */
    @Pattern(regexp = "^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$", message = "validation.canvasColorPattern")
    private String canvasBackgroundColor;

    /** Width of the canvas in pixels (validated range) */
    @Min(value = CANVAS_WIDTH_MIN, message = "validation.canvasWidthMin")
    @Max(value = CANVAS_WIDTH_MAX, message = "validation.canvasWidthMax")
    private Integer canvasWidth;

    /** Height of the canvas in pixels (validated range) */
    @Min(value = CANVAS_HEIGHT_MIN, message = "validation.canvasHeightMin")
    @Max(value = CANVAS_HEIGHT_MAX, message = "validation.canvasHeightMax")
    private Integer canvasHeight;
}
