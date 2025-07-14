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

/**
 * Controller for handling real-time board activities via WebSockets.
 * Manages chat messages and drawing actions on the board.
 */
@Controller
@RequiredArgsConstructor
public class BoardActivityController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final BoardObjectService boardObjectService;
    private final UserRepository userRepository;

    /**
     * Handles incoming chat messages from users.
     * It broadcasts the message to all subscribers of the specific board topic.
     *
     * @param request   the chat message request DTO.
     * @param principal the authenticated user sending the message.
     */
    @MessageMapping(MAPPING_CHAT_SEND_MESSAGE)
    public void sendMessage(@Payload ChatMessageDTO.Request request, Principal principal) {

        // 1. Get the user's email from the principal
        String userEmail = principal.getName();

        // 2. Find the user in the database by their email
        User senderUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        // 3. Create the full name string
        String fullName = senderUser.getFirstName() + " " + senderUser.getLastName();

        ChatMessageDTO.Response response = ChatMessageDTO.Response.builder()
                .type(ChatMessageDTO.Response.MessageType.CHAT)
                .content(request.getContent())
                .sender(fullName)
                // .sender(principal.getName())
                .timestamp(LocalDateTime.now())
                .build();
        // Construct the destination topic for the specific board.
        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();
        messagingTemplate.convertAndSend(destination, response);
    }

    /**
     * Handles drawing actions performed by users on the board.
     * It broadcasts the action to all other users on the same board and saves the
     * action to the database.
     *
     * @param request   the board action request DTO.
     * @param principal the authenticated user performing the action.
     */
    @MessageMapping(MAPPING_BOARD_DRAW_ACTION)
    public void handleDrawAction(@Payload BoardActionDTO.Request request, Principal principal) {

        BoardActionDTO.Response response = BoardActionDTO.Response.builder()
                .type(request.getType())
                .payload(request.getPayload())
                .sender(principal.getName())
                .instanceId(request.getInstanceId())
                .build();

        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();

        // Broadcast the action to all clients subscribed to the board.
        messagingTemplate.convertAndSend(destination, response);

        // Persist the drawing action to the database.
        try {
            boardObjectService.saveDrawAction(request, principal.getName());
        } catch (Exception e) {
        }
    }
}