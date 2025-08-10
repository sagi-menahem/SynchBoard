package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.MAPPING_BOARD_DRAW_ACTION;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.MAPPING_CHAT_SEND_MESSAGE;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import java.security.Principal;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import io.github.sagimenahem.synchboard.dto.websocket.BoardActionDTO;
import io.github.sagimenahem.synchboard.dto.websocket.ChatMessageDTO;
import io.github.sagimenahem.synchboard.dto.error.ErrorResponseDTO;
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
        try {
            chatService.processAndSaveMessage(request, principal);
        } catch (Exception e) {
            log.error("Failed to process chat message for board {}: {}", 
                    request.getBoardId(), e.getMessage(), e);
            messagingTemplate.convertAndSendToUser(
                    principal.getName(), "/topic/errors",
                    new ErrorResponseDTO("Failed to send message", "CHAT_ERROR")
            );
        }
    }

    @MessageMapping(MAPPING_BOARD_DRAW_ACTION)
    public void handleDrawAction(@Payload BoardActionDTO.Request request, Principal principal) {
        try {
            BoardActionDTO.Response response = BoardActionDTO.Response.builder().type(request.getType())
                    .payload(request.getPayload()).sender(principal.getName())
                    .instanceId(request.getInstanceId()).build();

            String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();

            messagingTemplate.convertAndSend(destination, response);
            boardObjectService.saveDrawAction(request, principal.getName());
        } catch (Exception e) {
            log.error("Failed to process draw action for board {}: {}", 
                    request.getBoardId(), e.getMessage(), e);
            messagingTemplate.convertAndSendToUser(
                    principal.getName(), "/topic/errors",
                    new ErrorResponseDTO("Failed to save draw action", "DRAW_ACTION_ERROR")
            );
        }
    }
}
