// File: backend/src/main/java/com/synchboard/backend/controller/BoardActivityController.java

package com.synchboard.backend.controller;

import com.synchboard.backend.dto.websocket.BoardActionResponse;
import com.synchboard.backend.dto.websocket.ChatMessageResponse;
import com.synchboard.backend.dto.websocket.SendBoardActionRequest;
import com.synchboard.backend.dto.websocket.SendChatMessageRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class BoardActivityController {

    private final SimpMessageSendingOperations messagingTemplate;
    // 2. Add a logger instance
    private static final Logger log = LoggerFactory.getLogger(BoardActivityController.class);

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload SendChatMessageRequest request, Principal principal) {
        // ... (this method remains the same)
        ChatMessageResponse response = ChatMessageResponse.builder()
                .type(ChatMessageResponse.MessageType.CHAT)
                .content(request.getContent())
                .sender(principal.getName())
                .timestamp(LocalDateTime.now())
                .build();
        String destination = "/topic/board/" + request.getBoardId();
        messagingTemplate.convertAndSend(destination, response);
    }

    @MessageMapping("/board.drawAction")
    public void handleDrawAction(@Payload SendBoardActionRequest request, Principal principal) {
        // 3. Add logging to this method
        log.info("Received draw action from user: {}", principal.getName());
        log.info("Action details: {}", request);

        BoardActionResponse response = BoardActionResponse.builder()
                .type(request.getType())
                .payload(request.getPayload())
                .sender(principal.getName())
                .instanceId(request.getInstanceId())
                .build();

        String destination = "/topic/board/" + request.getBoardId();

        log.info("Broadcasting action response to destination: {}", destination);
        messagingTemplate.convertAndSend(destination, response);
        log.info("Action response successfully sent to broker relay.");
    }
}