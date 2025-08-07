package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.config.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import static io.github.sagimenahem.synchboard.config.constants.WebSocketConstants.WEBSOCKET_USER_TOPIC_PREFIX;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import io.github.sagimenahem.synchboard.dto.websocket.BoardUpdateDTO;
import io.github.sagimenahem.synchboard.dto.websocket.UserUpdateDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardNotificationService {

    private final SimpMessageSendingOperations messagingTemplate;

    public void broadcastBoardUpdate(Long boardId, BoardUpdateDTO.UpdateType updateType,
            String sourceUserEmail) {
        BoardUpdateDTO payload = new BoardUpdateDTO(updateType, sourceUserEmail);
        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + boardId;

        log.info("Broadcasting update of type {} to destination {} from user {}", updateType,
                destination, sourceUserEmail);
        messagingTemplate.convertAndSend(destination, payload);
    }

    public void broadcastUserUpdate(String userEmail) {
        UserUpdateDTO payload = new UserUpdateDTO(UserUpdateDTO.UpdateType.BOARD_LIST_CHANGED);
        String destination = WEBSOCKET_USER_TOPIC_PREFIX + userEmail;

        log.info("Sending user-specific update to {}", destination);
        messagingTemplate.convertAndSend(destination, payload);
    }
}
