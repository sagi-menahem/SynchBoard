// File: backend/src/main/java/com/synchboard/backend/dto/websocket/ChatMessageDTO.java
package com.synchboard.backend.dto.websocket;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class ChatMessageDTO {

    private ChatMessageDTO() {
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String content;
        private Long boardId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        private MessageType type;
        private String content;
        private LocalDateTime timestamp;

        private String senderEmail;
        private String senderFullName;
        private String senderProfilePictureUrl;

        public enum MessageType {
            CHAT,
            JOIN,
            LEAVE
        }
    }
}