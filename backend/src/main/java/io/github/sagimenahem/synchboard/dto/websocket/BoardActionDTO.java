package io.github.sagimenahem.synchboard.dto.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for board action WebSocket communications. Contains nested Request and
 * Response classes for handling canvas object operations (add, update, delete) in real-time
 * collaborative sessions.
 * 
 * @author Sagi Menahem
 */
public final class BoardActionDTO {

    private BoardActionDTO() {}

    /** Enumeration of possible board action types */
    public enum ActionType {
        /** Adding a new canvas object */
        OBJECT_ADD,
        /** Updating an existing canvas object */
        OBJECT_UPDATE,
        /** Deleting a canvas object */
        OBJECT_DELETE,
    }

    /**
     * Request class for incoming board action messages from WebSocket clients. Contains the action
     * details and context information needed to process canvas object modifications.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {

        /** ID of the board where the action is taking place */
        private Long boardId;

        /** Type of action being performed */
        private ActionType type;

        /** JSON payload containing the object data */
        private JsonNode payload;

        /** Unique instance identifier for deduplication */
        private String instanceId;
    }

    /**
     * Response class for outgoing board action messages to WebSocket clients. Contains the action
     * details and sender information for broadcasting canvas object changes to other collaborators.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        /** Type of action that was performed */
        private ActionType type;

        /** JSON payload containing the object data */
        private JsonNode payload;

        /** Email of the user who performed the action */
        private String sender;

        /** Unique instance identifier for deduplication */
        private String instanceId;
    }
}
