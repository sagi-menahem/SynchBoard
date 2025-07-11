// File: backend/src/main/java/com/synchboard/backend/dto/websocket/BoardActionDTO.java
package com.synchboard.backend.dto.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A container for board action DTOs, including request and response objects.
 * This class is final and has a private constructor to prevent instantiation.
 */
public final class BoardActionDTO {

    /**
     * Private constructor to prevent instantiation of the utility class.
     */
    private BoardActionDTO() {
    }

    /**
     * Enum representing the types of actions that can be performed on a board
     * object.
     */
    public enum ActionType {
        OBJECT_ADD,
        OBJECT_UPDATE,
        OBJECT_DELETE
    }

    /**
     * DTO for an incoming board action request from a client.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        /** The ID of the board where the action occurs. */
        private Long boardId;
        /** The type of the action (e.g., ADD, UPDATE, DELETE). */
        private ActionType type;
        /** The data payload for the action, represented as JSON. */
        private JsonNode payload;
        /**
         * A unique identifier for the object instance on the client-side, used for
         * tracking.
         */
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
        /** The type of the action. */
        private ActionType type;
        /** The data payload of the action. */
        private JsonNode payload;
        /** The email of the user who initiated the action. */
        private String sender;
        /** The unique client-side identifier for the object instance. */
        private String instanceId;
    }
}