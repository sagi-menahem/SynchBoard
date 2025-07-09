// File: backend/src/main/java/com/synchboard/backend/dto/websocket/SendChatMessageRequest.java

package com.synchboard.backend.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a request from a client to send a chat message to a specific
 * board.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendChatMessageRequest {

    private String content;
    private Long boardId;
}