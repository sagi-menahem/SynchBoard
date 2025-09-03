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
        private String instanceId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        private Long id;
        private MessageType type;
        private String content;
        private LocalDateTime timestamp;

        private String senderEmail;
        private String senderFullName;
        private String senderProfilePictureUrl;

        private String instanceId;

        public enum MessageType {
            CHAT, JOIN, LEAVE
        }
    }
}
