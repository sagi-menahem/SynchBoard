// File: backend/src/main/java/com/synchboard/backend/dto/websocket/ChatMessageDTO.java

package com.synchboard.backend.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * A container class for all chat-related Data Transfer Objects (DTOs).
 * This approach uses nested static classes to group related request and
 * response models.
 */
public final class ChatMessageDTO {

    /**
     * Private constructor to prevent instantiation of the container class.
     */
    private ChatMessageDTO() {
    }

    /**
     * Represents a request from a client to send a chat message to a specific
     * board.
     * This class replaces the original SendChatMessageRequest.java.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String content;
        private Long boardId;
    }

    /**
     * Represents a chat message broadcast from the server to all clients in a
     * channel.
     * This class replaces the original ChatMessageResponse.java.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        private MessageType type;
        private String content;
        private String sender;
        private LocalDateTime timestamp;

        public enum MessageType {
            CHAT,
            JOIN,
            LEAVE
        }
    }
}