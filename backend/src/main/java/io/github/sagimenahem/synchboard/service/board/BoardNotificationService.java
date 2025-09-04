package io.github.sagimenahem.synchboard.service.board;

import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.WEBSOCKET_USER_TOPIC_PREFIX;

import io.github.sagimenahem.synchboard.dto.websocket.BoardUpdateDTO;
import io.github.sagimenahem.synchboard.dto.websocket.UserUpdateDTO;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardNotificationService {

    private final SimpMessageSendingOperations messagingTemplate;
    private final GroupMemberRepository groupMemberRepository;

    public void broadcastBoardUpdate(Long boardId, BoardUpdateDTO.UpdateType updateType, String sourceUserEmail) {
        BoardUpdateDTO payload = new BoardUpdateDTO(updateType, sourceUserEmail);
        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + boardId;

        log.info(
            "Broadcasting update of type {} to destination {} from user {}",
            updateType,
            destination,
            sourceUserEmail
        );
        messagingTemplate.convertAndSend(destination, payload);
    }

    public void broadcastUserUpdate(String userEmail) {
        UserUpdateDTO payload = new UserUpdateDTO(UserUpdateDTO.UpdateType.BOARD_LIST_CHANGED);
        String destination = WEBSOCKET_USER_TOPIC_PREFIX + userEmail;

        log.info("Sending user-specific update to {}", destination);
        messagingTemplate.convertAndSend(destination, payload);
    }

    public void broadcastUserDetailsChanged(String userEmail) {
        UserUpdateDTO payload = new UserUpdateDTO(UserUpdateDTO.UpdateType.BOARD_DETAILS_CHANGED);
        String destination = WEBSOCKET_USER_TOPIC_PREFIX + userEmail;

        log.info("Sending board details change notification to {}", destination);
        messagingTemplate.convertAndSend(destination, payload);
    }

    public void broadcastUserUpdatesToAllBoardMembers(Long boardId) {
        List<String> memberEmails = getBoardMemberEmails(boardId);
        broadcastToUserList(
            memberEmails,
            UserUpdateDTO.UpdateType.BOARD_LIST_CHANGED,
            "user updates to board " + boardId + " members"
        );
    }

    public void broadcastUserUpdatesToUsers(List<String> userEmails) {
        broadcastToUserList(userEmails, UserUpdateDTO.UpdateType.BOARD_LIST_CHANGED, "user updates to specified users");
    }

    public void broadcastBoardDetailsChangedToAllBoardMembers(Long boardId) {
        List<String> memberEmails = getBoardMemberEmails(boardId);
        broadcastToUserList(
            memberEmails,
            UserUpdateDTO.UpdateType.BOARD_DETAILS_CHANGED,
            "board details changes to board " + boardId + " members"
        );
    }

    public void broadcastBoardUpdatesToMultipleBoards(
        List<Long> boardIds,
        BoardUpdateDTO.UpdateType updateType,
        String sourceUserEmail
    ) {
        if (boardIds == null || boardIds.isEmpty()) {
            log.debug("No board IDs provided for broadcasting");
            return;
        }

        BoardUpdateDTO payload = new BoardUpdateDTO(updateType, sourceUserEmail);
        log.info("Broadcasting {} updates to {} boards from user {}", updateType, boardIds.size(), sourceUserEmail);

        boardIds
            .parallelStream()
            .forEach((boardId) -> {
                String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + boardId;
                messagingTemplate.convertAndSend(destination, payload);
            });
    }

    private List<String> getBoardMemberEmails(Long boardId) {
        List<String> memberEmails = groupMemberRepository.findEmailsByBoardId(boardId);
        if (memberEmails.isEmpty()) {
            log.debug("No members found for board {}", boardId);
        }
        return memberEmails;
    }

    private void broadcastToUserList(List<String> userEmails, UserUpdateDTO.UpdateType updateType, String operation) {
        if (userEmails == null || userEmails.isEmpty()) {
            log.debug("No user emails provided for {}", operation);
            return;
        }

        UserUpdateDTO payload = new UserUpdateDTO(updateType);
        log.info("Broadcasting {} to {} users", operation, userEmails.size());

        userEmails
            .parallelStream()
            .forEach((email) -> {
                String destination = WEBSOCKET_USER_TOPIC_PREFIX + email;
                messagingTemplate.convertAndSend(destination, payload);
            });
    }
}
