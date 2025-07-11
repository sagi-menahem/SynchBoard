// File: backend/src/main/java/com/synchboard/backend/dto/websocket/BoardActionDTO.java

package com.synchboard.backend.dto.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A container class for all board-action-related Data Transfer Objects (DTOs).
 * This approach uses a shared enum and nested static classes for
 * request/response models.
 */
public final class BoardActionDTO {

    /**
     * Private constructor to prevent instantiation of the container class.
     */
    private BoardActionDTO() {
    }

    /**
     * Shared enum for different types of board actions.
     * Accessible via BoardActionDTO.ActionType
     */
    public enum ActionType {
        OBJECT_ADD,
        OBJECT_UPDATE,
        OBJECT_DELETE
    }

    /**
     * Represents a request from a client to perform an action on a specific board.
     * This class replaces SendBoardActionRequest.java.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private Long boardId;
        private ActionType type;
        private JsonNode payload;
        private String instanceId;
    }

    /**
     * Represents a board action broadcast from the server to all clients.
     * This class replaces BoardActionResponse.java.
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