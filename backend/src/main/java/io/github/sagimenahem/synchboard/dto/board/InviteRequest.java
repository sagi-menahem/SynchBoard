package io.github.sagimenahem.synchboard.dto.board;

import io.github.sagimenahem.synchboard.validation.ValidEmail;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InviteRequest {

    @ValidEmail
    private String email;
}
