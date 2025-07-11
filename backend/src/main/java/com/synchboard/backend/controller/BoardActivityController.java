// File: backend/src/main/java/com/synchboard/backend/controller/BoardActivityController.java

package com.synchboard.backend.controller;

import com.synchboard.backend.dto.websocket.BoardActionDTO;
import com.synchboard.backend.dto.websocket.ChatMessageDTO;
import com.synchboard.backend.service.BoardObjectService; // 1. Import the new service
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
    private final BoardObjectService boardObjectService; // 2. Inject the service
    private static final Logger log = LoggerFactory.getLogger(BoardActivityController.class);

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO.Request request, Principal principal) {
        // ... (this method remains the same)
        ChatMessageDTO.Response response = ChatMessageDTO.Response.builder()
                .type(ChatMessageDTO.Response.MessageType.CHAT)
                .content(request.getContent())
                .sender(principal.getName())
                .timestamp(LocalDateTime.now())
                .build();
        String destination = "/topic/board/" + request.getBoardId();
        messagingTemplate.convertAndSend(destination, response);
    }

    @MessageMapping("/board.drawAction")
    public void handleDrawAction(@Payload BoardActionDTO.Request request, Principal principal) {
        log.info("Received draw action from user: {}", principal.getName());

        BoardActionDTO.Response response = BoardActionDTO.Response.builder()
                .type(request.getType())
                .payload(request.getPayload())
                .sender(principal.getName())
                .instanceId(request.getInstanceId())
                .build();

        String destination = "/topic/board/" + request.getBoardId();

        // First, broadcast the action for immediate real-time feedback
        messagingTemplate.convertAndSend(destination, response);
        log.info("Action response broadcast to destination: {}", destination);

        // 3. Then, call the service to save the action to the database
        try {
            boardObjectService.saveDrawAction(request, principal.getName());
        } catch (Exception e) {
            log.error("Failed to save board object for boardId: {}", request.getBoardId(), e);
            // In a real application, you might send an error message back to the user
        }
    }
}