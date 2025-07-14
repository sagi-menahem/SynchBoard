// File: backend/src/main/java/com/synchboard/backend/dto/websocket/BoardActionDTO.java
package com.synchboard.backend.dto.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class BoardActionDTO {

    private BoardActionDTO() {
    }

    public enum ActionType {
        OBJECT_ADD,
        OBJECT_UPDATE,
        OBJECT_DELETE
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private Long boardId;
        private ActionType type;
        private JsonNode payload;
        
        // A unique identifier for the object instance on the client-side, used for tracking.
        private String instanceId;
    }

    /**
     * DTO for broadcasting a board action response to clients.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private ActionType type;
        private JsonNode payload;
        private String sender;
        private String instanceId;
    }
}