// File: backend/src/main/java/com/synchboard/backend/dto/websocket/SendBoardActionRequest.java

package com.synchboard.backend.dto.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendBoardActionRequest {

    private Long boardId;
    private ActionType type; // Now uses the shared ActionType
    private JsonNode payload;
    private String instanceId;

    // The internal enum has been removed from here.
}