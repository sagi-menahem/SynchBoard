package io.github.sagimenahem.synchboard.dto.board;

import io.github.sagimenahem.synchboard.validation.ValidEmail;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for board member invitation requests. Contains the email address of the user
 * to be invited to join a board with validation to ensure proper email format.
 *
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InviteRequest {

    /** Email address of the user to invite (validated format) */
    @ValidEmail
    private String email;
}
