package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.MAPPING_BOARD_DRAW_ACTION;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.MAPPING_CHAT_SEND_MESSAGE;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;

import io.github.sagimenahem.synchboard.dto.error.ErrorResponseDTO;
import io.github.sagimenahem.synchboard.dto.websocket.BoardActionDTO;
import io.github.sagimenahem.synchboard.dto.websocket.ChatMessageDTO;
import io.github.sagimenahem.synchboard.repository.GroupBoardRepository;
import io.github.sagimenahem.synchboard.service.board.BoardNotificationService;
import io.github.sagimenahem.synchboard.service.board.BoardObjectService;
import io.github.sagimenahem.synchboard.service.board.ChatService;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for handling real-time collaborative board activities. Manages WebSocket
 * message mapping for chat messages and drawing actions, enabling real-time synchronization of
 * board state across multiple users.
 *
 * @author Sagi Menahem
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class BoardActivityController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final BoardObjectService boardObjectService;
    private final ChatService chatService;
    private final BoardNotificationService notificationService;
    private final GroupBoardRepository groupBoardRepository;

    /**
     * Handles incoming chat messages from WebSocket clients. Processes, persists, and broadcasts
     * chat messages to all board members.
     *
     * @param request the chat message request containing message content and board ID
     * @param principal the authenticated user principal who sent the message
     */
    @MessageMapping(MAPPING_CHAT_SEND_MESSAGE)
    public void sendMessage(@Payload ChatMessageDTO.Request request, Principal principal) {
        String userEmail = principal.getName();

        log.debug(
            DIAGNOSTIC_PREFIX + " Received WebSocket message at /app/chat.sendMessage. Payload: {}",
            request.toString()
        );

        log.debug(WEBSOCKET_MESSAGE_RECEIVED, "CHAT_MESSAGE", request.getBoardId(), userEmail);

        try {
            // Process message content and broadcast to all board members
            chatService.processAndSaveMessage(request, principal);
            log.info(CHAT_MESSAGE_SENT, request.getBoardId(), userEmail, "new-message");

            // Update board's last activity timestamp for sorting and notifications
            updateBoardActivity(request.getBoardId());
        } catch (Exception e) {
            log.error(
                WEBSOCKET_PREFIX + " Failed to process chat message. BoardId: {}, User: {}, Error: {}",
                request.getBoardId(),
                userEmail,
                e.getMessage(),
                e
            );
            messagingTemplate.convertAndSendToUser(
                userEmail,
                "/topic/errors",
                new ErrorResponseDTO("Failed to send message", "CHAT_ERROR")
            );
        }
    }

    /**
     * Handles drawing and board modification actions from WebSocket clients. Processes drawing
     * commands, saves them to database, and broadcasts to all board members.
     *
     * @param request the board action request containing drawing data and board ID
     * @param principal the authenticated user principal who performed the action
     */
    @MessageMapping(MAPPING_BOARD_DRAW_ACTION)
    public void handleDrawAction(@Payload BoardActionDTO.Request request, Principal principal) {
        String userEmail = principal.getName();
        log.debug(WEBSOCKET_MESSAGE_RECEIVED, request.getType(), request.getBoardId(), userEmail);

        try {
            // Build response with sender information for real-time collaboration
            BoardActionDTO.Response response = BoardActionDTO.Response.builder()
                .type(request.getType())
                .payload(request.getPayload())
                .sender(userEmail)
                .instanceId(request.getInstanceId())
                .build();

            // Broadcast drawing action to all board subscribers
            String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();
            messagingTemplate.convertAndSend(destination, response);
            log.debug(WEBSOCKET_MESSAGE_SENT, request.getType(), request.getBoardId(), userEmail);

            // Persist drawing action to database for board state recovery
            boardObjectService.saveDrawAction(request, userEmail);
            log.info(ACTION_SAVED, request.getBoardId(), userEmail, request.getType());

            // Update board activity for real-time updates to board list
            updateBoardActivity(request.getBoardId());
        } catch (Exception e) {
            log.error(
                WEBSOCKET_PREFIX + " Failed to process draw action. BoardId: {}, User: {}, Type: {}, Error: {}",
                request.getBoardId(),
                userEmail,
                request.getType(),
                e.getMessage(),
                e
            );
            messagingTemplate.convertAndSendToUser(
                userEmail,
                "/topic/errors",
                new ErrorResponseDTO("Failed to save draw action", "DRAW_ACTION_ERROR")
            );
        }
    }

    /**
     * Updates board activity timestamp and notifies all members of board changes. Used to maintain
     * real-time board list updates and activity tracking.
     *
     * @param boardId the unique identifier of the board to update
     */
    private void updateBoardActivity(Long boardId) {
        try {
            // Update the board's last modified timestamp for sorting
            groupBoardRepository.updateLastModifiedDate(boardId);

            // Notify all board members of activity changes for real-time UI updates
            notificationService.broadcastBoardDetailsChangedToAllBoardMembers(boardId);

            log.debug("Board activity updated for boardId: {}", boardId);
        } catch (Exception e) {
            log.warn("Failed to update board activity for boardId: {}, Error: {}", boardId, e.getMessage());
        }
    }
}
