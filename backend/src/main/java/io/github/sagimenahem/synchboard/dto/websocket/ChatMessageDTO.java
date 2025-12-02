package io.github.sagimenahem.synchboard.dto.websocket;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for chat message WebSocket communications. Contains nested Request and
 * Response classes for handling real-time chat functionality within board collaboration sessions.
 *
 * @author Sagi Menahem
 */
public final class ChatMessageDTO {

    private ChatMessageDTO() {}

    /**
     * Request class for incoming chat messages from WebSocket clients. Contains the message content
     * and context information needed to process and persist chat messages.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {

        /** Text content of the chat message */
        private String content;

        /** ID of the board where the message is being sent */
        private Long boardId;

        /** Unique instance identifier for deduplication */
        private String instanceId;
    }

    /**
     * Response class for outgoing chat messages to WebSocket clients. Contains the complete message
     * information including sender details for displaying chat messages to all board members.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        /** Unique identifier of the chat message */
        private Long id;

        /** Type of message (chat content, join/leave notifications) */
        private MessageType type;

        /** Text content of the chat message */
        private String content;

        /** Timestamp when the message was created */
        private LocalDateTime timestamp;

        /** Email of the message sender */
        private String senderEmail;

        /** Full name of the message sender */
        private String senderFullName;

        /** URL to the sender's profile picture */
        private String senderProfilePictureUrl;

        /** Unique instance identifier for deduplication */
        private String instanceId;

        /** Enumeration of possible message types */
        public enum MessageType {
            /** Regular chat message from a user */
            CHAT,
            /** System message indicating a user joined the board */
            JOIN,
            /** System message indicating a user left the board */
            LEAVE,
        }
    }
}
