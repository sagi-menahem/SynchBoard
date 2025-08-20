package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.MAPPING_BOARD_DRAW_ACTION;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.MAPPING_CHAT_SEND_MESSAGE;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import java.security.Principal;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import io.github.sagimenahem.synchboard.dto.error.ErrorResponseDTO;
import io.github.sagimenahem.synchboard.dto.websocket.BoardActionDTO;
import io.github.sagimenahem.synchboard.dto.websocket.ChatMessageDTO;
import io.github.sagimenahem.synchboard.service.BoardObjectService;
import io.github.sagimenahem.synchboard.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class BoardActivityController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final BoardObjectService boardObjectService;
    private final ChatService chatService;

    @MessageMapping(MAPPING_CHAT_SEND_MESSAGE)
    public void sendMessage(@Payload ChatMessageDTO.Request request, Principal principal) {
        String userEmail = principal.getName();
        
        log.debug("[DIAGNOSTIC] Received WebSocket message at /app/chat.sendMessage. Payload: {}", request.toString());
        
        log.debug(WEBSOCKET_MESSAGE_RECEIVED, "CHAT_MESSAGE", request.getBoardId(), userEmail);

        try {
            chatService.processAndSaveMessage(request, principal);
            log.info(CHAT_MESSAGE_SENT, request.getBoardId(), userEmail, "new-message");
        } catch (Exception e) {
            log.error(
                    WEBSOCKET_PREFIX
                            + " Failed to process chat message. BoardId: {}, User: {}, Error: {}",
                    request.getBoardId(), userEmail, e.getMessage(), e);
            messagingTemplate.convertAndSendToUser(userEmail, "/topic/errors",
                    new ErrorResponseDTO("Failed to send message", "CHAT_ERROR"));
        }
    }

    @MessageMapping(MAPPING_BOARD_DRAW_ACTION)
    public void handleDrawAction(@Payload BoardActionDTO.Request request, Principal principal) {
        String userEmail = principal.getName();
        log.debug(WEBSOCKET_MESSAGE_RECEIVED, request.getType(), request.getBoardId(), userEmail);

        try {
            BoardActionDTO.Response response = BoardActionDTO.Response.builder()
                    .type(request.getType()).payload(request.getPayload()).sender(userEmail)
                    .instanceId(request.getInstanceId()).build();

            String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();

            messagingTemplate.convertAndSend(destination, response);
            log.debug(WEBSOCKET_MESSAGE_SENT, request.getType(), request.getBoardId(), userEmail);

            boardObjectService.saveDrawAction(request, userEmail);
            log.info(ACTION_SAVED, request.getBoardId(), userEmail, request.getType());
        } catch (Exception e) {
            log.error(WEBSOCKET_PREFIX
                    + " Failed to process draw action. BoardId: {}, User: {}, Type: {}, Error: {}",
                    request.getBoardId(), userEmail, request.getType(), e.getMessage(), e);
            messagingTemplate.convertAndSendToUser(userEmail, "/topic/errors",
                    new ErrorResponseDTO("Failed to save draw action", "DRAW_ACTION_ERROR"));
        }
    }
}
