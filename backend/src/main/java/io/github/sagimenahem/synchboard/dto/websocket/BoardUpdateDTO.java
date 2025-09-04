package io.github.sagimenahem.synchboard.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardUpdateDTO {

    private UpdateType updateType;
    private String sourceUserEmail;

    public enum UpdateType {
        DETAILS_UPDATED,

        MEMBERS_UPDATED,

        CANVAS_UPDATED,
    }
}
