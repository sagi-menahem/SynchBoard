package io.github.sagimenahem.synchboard.dto.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class BoardActionDTO {

    private BoardActionDTO() {}

    public enum ActionType {
        OBJECT_ADD,
        OBJECT_UPDATE,
        OBJECT_DELETE,
    }

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
