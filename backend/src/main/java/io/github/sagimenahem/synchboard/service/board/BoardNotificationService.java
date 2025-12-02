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

/**
 * Service for broadcasting real-time notifications to board members and users. Handles WebSocket
 * messaging for board updates, user-specific notifications, and cross-board communication using
 * STOMP messaging protocol.
 *
 * @author Sagi Menahem
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BoardNotificationService {

    /** Template for sending WebSocket messages */
    private final SimpMessageSendingOperations messagingTemplate;
    /** Repository for retrieving board member information */
    private final GroupMemberRepository groupMemberRepository;

    /**
     * Broadcasts board update notifications to all members of a specific board.
     *
     * @param boardId The ID of the board to broadcast to
     * @param updateType The type of update being broadcast
     * @param sourceUserEmail The email of the user who triggered the update
     */
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

    /**
     * Sends a board list change notification to a specific user.
     *
     * @param userEmail The email of the user to notify
     */
    public void broadcastUserUpdate(String userEmail) {
        UserUpdateDTO payload = new UserUpdateDTO(UserUpdateDTO.UpdateType.BOARD_LIST_CHANGED);
        String destination = WEBSOCKET_USER_TOPIC_PREFIX + userEmail;

        log.info("Sending user-specific update to {}", destination);
        messagingTemplate.convertAndSend(destination, payload);
    }

    /**
     * Sends a board details change notification to a specific user.
     *
     * @param userEmail The email of the user to notify
     */
    public void broadcastUserDetailsChanged(String userEmail) {
        UserUpdateDTO payload = new UserUpdateDTO(UserUpdateDTO.UpdateType.BOARD_DETAILS_CHANGED);
        String destination = WEBSOCKET_USER_TOPIC_PREFIX + userEmail;

        log.info("Sending board details change notification to {}", destination);
        messagingTemplate.convertAndSend(destination, payload);
    }

    /**
     * Broadcasts board list change notifications to all members of a specific board.
     *
     * @param boardId The ID of the board whose members should be notified
     */
    public void broadcastUserUpdatesToAllBoardMembers(Long boardId) {
        List<String> memberEmails = getBoardMemberEmails(boardId);
        broadcastToUserList(
            memberEmails,
            UserUpdateDTO.UpdateType.BOARD_LIST_CHANGED,
            "user updates to board " + boardId + " members"
        );
    }

    /**
     * Broadcasts board list change notifications to a specific list of users.
     *
     * @param userEmails List of user emails to notify
     */
    public void broadcastUserUpdatesToUsers(List<String> userEmails) {
        broadcastToUserList(userEmails, UserUpdateDTO.UpdateType.BOARD_LIST_CHANGED, "user updates to specified users");
    }

    /**
     * Broadcasts board details change notifications to all members of a specific board.
     *
     * @param boardId The ID of the board whose members should be notified
     */
    public void broadcastBoardDetailsChangedToAllBoardMembers(Long boardId) {
        List<String> memberEmails = getBoardMemberEmails(boardId);
        broadcastToUserList(
            memberEmails,
            UserUpdateDTO.UpdateType.BOARD_DETAILS_CHANGED,
            "board details changes to board " + boardId + " members"
        );
    }

    /**
     * Broadcasts board updates to multiple boards simultaneously. Uses parallel processing for
     * efficient delivery to large numbers of boards.
     *
     * @param boardIds List of board IDs to broadcast to
     * @param updateType The type of update being broadcast
     * @param sourceUserEmail The email of the user who triggered the update
     */
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

        // Use parallel processing for multiple board notifications to improve performance
        // Order doesn't matter for independent board notifications, so parallelization is safe
        boardIds
            .parallelStream()
            .forEach((boardId) -> {
                String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + boardId;
                messagingTemplate.convertAndSend(destination, payload);
            });
    }

    /**
     * Retrieves the email addresses of all members of a specific board.
     *
     * @param boardId The ID of the board to get member emails for
     * @return List of member email addresses
     */
    private List<String> getBoardMemberEmails(Long boardId) {
        List<String> memberEmails = groupMemberRepository.findEmailsByBoardId(boardId);
        if (memberEmails.isEmpty()) {
            log.debug("No members found for board {}", boardId);
        }
        return memberEmails;
    }

    /**
     * Broadcasts user updates to a list of users using parallel processing.
     *
     * @param userEmails List of user emails to notify
     * @param updateType The type of update being broadcast
     * @param operation Description of the operation for logging purposes
     */
    private void broadcastToUserList(List<String> userEmails, UserUpdateDTO.UpdateType updateType, String operation) {
        if (userEmails == null || userEmails.isEmpty()) {
            log.debug("No user emails provided for {}", operation);
            return;
        }

        UserUpdateDTO payload = new UserUpdateDTO(updateType);
        log.info("Broadcasting {} to {} users", operation, userEmails.size());

        // Use parallel processing for multiple user notifications to improve performance
        // Each user notification is independent, so parallel execution is safe and faster
        userEmails
            .parallelStream()
            .forEach((email) -> {
                String destination = WEBSOCKET_USER_TOPIC_PREFIX + email;
                messagingTemplate.convertAndSend(destination, payload);
            });
    }
}
