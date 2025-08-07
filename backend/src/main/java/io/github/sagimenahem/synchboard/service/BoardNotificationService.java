package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.config.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import static io.github.sagimenahem.synchboard.config.constants.WebSocketConstants.WEBSOCKET_USER_TOPIC_PREFIX;
import java.util.List;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import io.github.sagimenahem.synchboard.dto.websocket.BoardUpdateDTO;
import io.github.sagimenahem.synchboard.dto.websocket.UserUpdateDTO;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardNotificationService {

    private final SimpMessageSendingOperations messagingTemplate;
    private final GroupMemberRepository groupMemberRepository;

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

    public void broadcastUserUpdatesToAllBoardMembers(Long boardId) {
        List<String> memberEmails = groupMemberRepository.findEmailsByBoardId(boardId);
        if (memberEmails.isEmpty()) {
            log.debug("No members found for board {}", boardId);
            return;
        }

        UserUpdateDTO payload = new UserUpdateDTO(UserUpdateDTO.UpdateType.BOARD_LIST_CHANGED);
        log.info("Broadcasting user updates to {} members of board {}", memberEmails.size(), boardId);
        
        memberEmails.parallelStream().forEach(email -> {
            String destination = WEBSOCKET_USER_TOPIC_PREFIX + email;
            messagingTemplate.convertAndSend(destination, payload);
        });
    }

    public void broadcastUserUpdatesToUsers(List<String> userEmails) {
        if (userEmails == null || userEmails.isEmpty()) {
            log.debug("No user emails provided for broadcasting");
            return;
        }

        UserUpdateDTO payload = new UserUpdateDTO(UserUpdateDTO.UpdateType.BOARD_LIST_CHANGED);
        log.info("Broadcasting user updates to {} users", userEmails.size());
        
        userEmails.parallelStream().forEach(email -> {
            String destination = WEBSOCKET_USER_TOPIC_PREFIX + email;
            messagingTemplate.convertAndSend(destination, payload);
        });
    }

    public void broadcastBoardUpdatesToMultipleBoards(List<Long> boardIds, 
            BoardUpdateDTO.UpdateType updateType, String sourceUserEmail) {
        if (boardIds == null || boardIds.isEmpty()) {
            log.debug("No board IDs provided for broadcasting");
            return;
        }

        BoardUpdateDTO payload = new BoardUpdateDTO(updateType, sourceUserEmail);
        log.info("Broadcasting {} updates to {} boards from user {}", 
                updateType, boardIds.size(), sourceUserEmail);
        
        boardIds.parallelStream().forEach(boardId -> {
            String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + boardId;
            messagingTemplate.convertAndSend(destination, payload);
        });
    }
}
