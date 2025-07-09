// File: backend/src/main/java/com/synchboard/backend/dto/websocket/ChatMessageResponse.java

package com.synchboard.backend.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Represents a chat message broadcast from the server to all clients in a
 * channel.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

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