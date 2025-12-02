package io.github.sagimenahem.synchboard.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing a board member. Contains member information including contact
 * details, profile information, and access permissions for board membership display.
 *
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberDTO {

    /** Email address of the board member */
    private String email;

    /** First name of the board member */
    private String firstName;

    /** Last name of the board member */
    private String lastName;

    /** URL to the member's profile picture */
    private String profilePictureUrl;

    /** Whether this member has admin privileges on the board */
    private Boolean isAdmin;
}
