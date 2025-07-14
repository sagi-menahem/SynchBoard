// File: backend/src/main/java/com/synchboard/backend/controller/BoardActivityController.java
package com.synchboard.backend.controller;

import com.synchboard.backend.dto.websocket.BoardActionDTO;
import com.synchboard.backend.dto.websocket.ChatMessageDTO;
import com.synchboard.backend.repository.UserRepository;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.service.BoardObjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

import static com.synchboard.backend.config.ApplicationConstants.*;

@Controller
@RequiredArgsConstructor
public class BoardActivityController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final BoardObjectService boardObjectService;
    private final UserRepository userRepository;

    @MessageMapping(MAPPING_CHAT_SEND_MESSAGE)
    public void sendMessage(@Payload ChatMessageDTO.Request request, Principal principal) {

        String userEmail = principal.getName();

        User senderUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        String fullName = senderUser.getFirstName() + " " + senderUser.getLastName();

        ChatMessageDTO.Response response = ChatMessageDTO.Response.builder()
                .type(ChatMessageDTO.Response.MessageType.CHAT)
                .content(request.getContent())
                .sender(fullName)
                .timestamp(LocalDateTime.now())
                .build();
        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();
        messagingTemplate.convertAndSend(destination, response);
    }

    @MessageMapping(MAPPING_BOARD_DRAW_ACTION)
    public void handleDrawAction(@Payload BoardActionDTO.Request request, Principal principal) {

        BoardActionDTO.Response response = BoardActionDTO.Response.builder()
                .type(request.getType())
                .payload(request.getPayload())
                .sender(principal.getName())
                .instanceId(request.getInstanceId())
                .build();

        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();

        messagingTemplate.convertAndSend(destination, response);

        try {
            boardObjectService.saveDrawAction(request, principal.getName());
        } catch (Exception e) {
        }
    }
}