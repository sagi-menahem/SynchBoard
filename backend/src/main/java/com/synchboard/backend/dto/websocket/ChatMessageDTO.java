// File: backend/src/main/java/com/synchboard/backend/dto/websocket/ChatMessageDTO.java
package com.synchboard.backend.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * A container for chat message DTOs, including request and response objects.
 * This class is final and has a private constructor to prevent instantiation.
 */
public final class ChatMessageDTO {

    /**
     * Private constructor to prevent instantiation of the utility class.
     */
    private ChatMessageDTO() {
    }

    /**
     * DTO for an incoming chat message request from a client.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        /** The content of the chat message. */
        private String content;
        /** The ID of the board where the message is sent. */
        private Long boardId;
    }

    /**
     * DTO for broadcasting a chat message response to clients.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        /** The type of the message (e.g., CHAT, JOIN, LEAVE). */
        private MessageType type;
        /** The content of the message. */
        private String content;
        /** The email of the user who sent the message. */
        private String sender;
        /** The timestamp when the message was sent. */
        private LocalDateTime timestamp;

        /**
         * Enum representing the type of message being sent.
         */
        public enum MessageType {
            CHAT,
            JOIN,
            LEAVE
        }
    }
}