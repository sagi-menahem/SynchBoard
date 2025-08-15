package io.github.sagimenahem.synchboard.dto.websocket;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class ChatMessageDTO {

    private ChatMessageDTO() {}

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String content;
        private Long boardId;
        private String instanceId; // Added: Client-side transaction ID for message tracking
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        private Long id; // Added: Message ID from database
        private MessageType type;
        private String content;
        private LocalDateTime timestamp;

        private String senderEmail;
        private String senderFullName;
        private String senderProfilePictureUrl;
        
        private String instanceId; // Added: Echo back the client's transaction ID

        public enum MessageType {
            CHAT, JOIN, LEAVE
        }
    }
}