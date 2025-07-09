// File: backend/src/main/java/com/synchboard/backend/controller/BoardActivityController.java

package com.synchboard.backend.controller;

import com.synchboard.backend.dto.websocket.ChatMessageResponse;
import com.synchboard.backend.dto.websocket.SendChatMessageRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

/**
 * Controller to handle WebSocket messages for board activities like chat.
 */
@Controller
@RequiredArgsConstructor
public class BoardActivityController {

    private final SimpMessageSendingOperations messagingTemplate;

    /**
     * Handles incoming chat messages from a user.
     * The message is enriched with server-side data (sender, timestamp) and then
     * broadcast to all subscribers of the specific board's topic.
     *
     * @param request   The incoming message payload from the client.
     * @param principal The currently authenticated user, injected by Spring
     *                  Security.
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload SendChatMessageRequest request, Principal principal) {

        // 1. Create the response object to be broadcast
        ChatMessageResponse response = ChatMessageResponse.builder()
                .type(ChatMessageResponse.MessageType.CHAT)
                .content(request.getContent())
                .sender(principal.getName()) // Use the authenticated user's name
                .timestamp(LocalDateTime.now())
                .build();

        // 2. Determine the destination topic based on the board ID
        String destination = "/topic/board/" + request.getBoardId();

        // 3. Broadcast the message to all clients subscribed to the topic
        messagingTemplate.convertAndSend(destination, response);
    }
}