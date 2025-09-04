package io.github.sagimenahem.synchboard.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {

    private UpdateType updateType;

    public enum UpdateType {
        BOARD_LIST_CHANGED,

        BOARD_DETAILS_CHANGED,
    }
}
