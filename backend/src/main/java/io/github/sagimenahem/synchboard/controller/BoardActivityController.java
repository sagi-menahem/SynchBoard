// File: backend/src/main/java/io/github/sagimenahem/synchboard/controller/BoardActivityController.java
package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.config.constants.WebSocketConstants.MAPPING_BOARD_DRAW_ACTION;
import static io.github.sagimenahem.synchboard.config.constants.WebSocketConstants.MAPPING_CHAT_SEND_MESSAGE;
import static io.github.sagimenahem.synchboard.config.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import java.security.Principal;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import io.github.sagimenahem.synchboard.dto.websocket.BoardActionDTO;
import io.github.sagimenahem.synchboard.dto.websocket.ChatMessageDTO;
import io.github.sagimenahem.synchboard.service.BoardObjectService;
import io.github.sagimenahem.synchboard.service.ChatService;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class BoardActivityController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final BoardObjectService boardObjectService;
    private final ChatService chatService;

    @MessageMapping(MAPPING_CHAT_SEND_MESSAGE)
    public void sendMessage(@Payload ChatMessageDTO.Request request, Principal principal) {
        chatService.processAndSaveMessage(request, principal);
    }

    @MessageMapping(MAPPING_BOARD_DRAW_ACTION)
    public void handleDrawAction(@Payload BoardActionDTO.Request request, Principal principal) {
        BoardActionDTO.Response response = BoardActionDTO.Response.builder().type(request.getType())
                .payload(request.getPayload()).sender(principal.getName())
                .instanceId(request.getInstanceId()).build();

        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();

        messagingTemplate.convertAndSend(destination, response);

        try {
            boardObjectService.saveDrawAction(request, principal.getName());
        } catch (Exception e) {
        }
    }
}
