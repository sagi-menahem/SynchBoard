package io.github.sagimenahem.synchboard.service.board;

import static io.github.sagimenahem.synchboard.constants.ActionConstants.OBJECT_ADD_ACTION;
import static io.github.sagimenahem.synchboard.constants.ActionConstants.OBJECT_DELETE_ACTION;
import static io.github.sagimenahem.synchboard.constants.ActionConstants.OBJECT_UPDATE_ACTION;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.websocket.BoardActionDTO;
import io.github.sagimenahem.synchboard.entity.ActionHistory;
import io.github.sagimenahem.synchboard.entity.BoardObject;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import io.github.sagimenahem.synchboard.repository.ActionHistoryRepository;
import io.github.sagimenahem.synchboard.repository.BoardObjectRepository;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing board action history, including undo and redo operations. Handles tracking
 * and reversal of user actions on board objects including creation, updates, and deletions.
 * Provides real-time synchronization across all board members.
 *
 * @author Sagi Menahem
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ActionHistoryService {

    /** Repository for managing action history records */
    private final ActionHistoryRepository actionHistoryRepository;
    /** Repository for managing board objects */
    private final BoardObjectRepository boardObjectRepository;
    /** Template for sending WebSocket messages */
    private final SimpMessageSendingOperations messagingTemplate;
    /** Repository for validating board membership */
    private final GroupMemberRepository groupMemberRepository;
    /** JSON object mapper for parsing board object data */
    private final ObjectMapper objectMapper;

    /**
     * Undoes the last action performed on the specified board. Reverts the most recent non-undone
     * action and broadcasts the change to all board members.
     *
     * @param boardId The ID of the board
     * @param userEmail The email of the user requesting the undo
     * @return BoardActionDTO.Response containing the undo action details, or null if no actions to
     *         undo
     * @throws AccessDeniedException if the user is not a member of the board
     */
    @Transactional
    public BoardActionDTO.Response undoLastAction(Long boardId, String userEmail) {
        ActionHistory lastAction = actionHistoryRepository
            .findTopByBoardWithRelationsAndIsUndoneFalseOrderByTimestampDesc(boardId)
            .orElse(null);

        if (lastAction == null) {
            log.info("No active actions to undo for boardId: {}", boardId);
            return null;
        }

        return processUndoRedoAction(boardId, userEmail, lastAction, true, "undo");
    }

    /**
     * Redoes the last undone action on the specified board. Restores the most recently undone
     * action and broadcasts the change to all board members.
     *
     * @param boardId The ID of the board
     * @param userEmail The email of the user requesting the redo
     * @return BoardActionDTO.Response containing the redo action details, or null if no actions to
     *         redo
     * @throws AccessDeniedException if the user is not a member of the board
     */
    @Transactional
    public BoardActionDTO.Response redoLastAction(Long boardId, String userEmail) {
        ActionHistory lastUndoneAction = actionHistoryRepository
            .findTopByBoardWithRelationsAndIsUndoneTrueOrderByTimestampDesc(boardId)
            .orElse(null);

        if (lastUndoneAction == null) {
            log.info("No undone actions to redo for boardId: {}", boardId);
            return null;
        }

        return processUndoRedoAction(boardId, userEmail, lastUndoneAction, false, "redo");
    }

    /**
     * Processes undo/redo operations for object addition actions. For undo: marks the object as
     * inactive (soft delete). For redo: reactivates the object and restores it to the board.
     *
     * @param action The action history record to process
     * @param isUndo true for undo operation, false for redo
     * @return BoardActionDTO.Response containing the processed action, or null if object not found
     */
    private BoardActionDTO.Response processAddAction(ActionHistory action, boolean isUndo) {
        BoardObject boardObject = action.getBoardObject();
        if (boardObject == null) {
            return null;
        }

        if (isUndo) {
            boardObject.setActive(false);
            boardObjectRepository.save(boardObject);
            return createDeleteResponse(boardObject.getInstanceId());
        } else {
            boardObject.setActive(true);
            BoardObject persistedObject = boardObjectRepository.save(boardObject);
            return parseJsonAndCreateResponse(
                persistedObject.getObjectData(),
                BoardActionDTO.ActionType.OBJECT_ADD,
                persistedObject.getInstanceId(),
                "redo add"
            );
        }
    }

    /**
     * Processes undo/redo operations for object update actions. Restores the object to its previous
     * state (undo) or subsequent state (redo).
     *
     * @param action The action history record to process
     * @param isUndo true for undo operation, false for redo
     * @return BoardActionDTO.Response containing the processed action, or null if object not found
     *         or inactive
     */
    private BoardActionDTO.Response processUpdateAction(ActionHistory action, boolean isUndo) {
        log.info(
            "Handling {} update for object instanceId: {}",
            isUndo ? "undo" : "redo",
            action.getBoardObject().getInstanceId()
        );

        BoardObject boardObject = action.getBoardObject();
        if (boardObject == null || !boardObject.isActive()) {
            return null;
        }

        String targetState = isUndo ? action.getStateBefore() : action.getStateAfter();
        if (targetState == null) {
            return null;
        }

        boardObject.setObjectData(targetState);
        boardObject.setLastEditedByUser(action.getUser());
        BoardObject persistedObject = boardObjectRepository.save(boardObject);

        return parseJsonAndCreateResponse(
            targetState,
            BoardActionDTO.ActionType.OBJECT_UPDATE,
            persistedObject.getInstanceId(),
            isUndo ? "undo update" : "redo update"
        );
    }

    /**
     * Processes undo/redo operations for object deletion actions. For undo: reactivates the deleted
     * object. For redo: marks the object as inactive (soft delete).
     *
     * @param action The action history record to process
     * @param isUndo true for undo operation, false for redo
     * @return BoardActionDTO.Response containing the processed action, or null if no state change
     *         needed
     */
    private BoardActionDTO.Response processDeleteAction(ActionHistory action, boolean isUndo) {
        BoardObject boardObject = action.getBoardObject();
        if (boardObject == null) {
            return null;
        }

        if (isUndo) {
            if (!boardObject.isActive()) {
                boardObject.setActive(true);
                boardObject.setLastEditedByUser(action.getUser());
                BoardObject persistedObject = boardObjectRepository.save(boardObject);
                return parseJsonAndCreateResponse(
                    persistedObject.getObjectData(),
                    BoardActionDTO.ActionType.OBJECT_ADD,
                    persistedObject.getInstanceId(),
                    "undo delete"
                );
            }
        } else {
            if (boardObject.isActive()) {
                boardObject.setActive(false);
                boardObject.setLastEditedByUser(action.getUser());
                boardObjectRepository.save(boardObject);
                return createDeleteResponse(boardObject.getInstanceId());
            }
        }
        return null;
    }

    /**
     * Core method for processing undo/redo operations. Validates user membership, updates action
     * state, and broadcasts changes.
     *
     * @param boardId The ID of the board
     * @param userEmail The email of the user performing the operation
     * @param action The action history record to process
     * @param isUndo true for undo operation, false for redo
     * @param operationType Description of the operation for logging
     * @return BoardActionDTO.Response containing the processed action, or null if no response
     *         generated
     * @throws AccessDeniedException if the user is not a member of the board
     */
    private BoardActionDTO.Response processUndoRedoAction(
        Long boardId,
        String userEmail,
        ActionHistory action,
        boolean isUndo,
        String operationType
    ) {
        if (!isUserMember(boardId, userEmail)) {
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }

        if (isUndo) {
            action.setUndone(true);
            actionHistoryRepository.save(action);
        } else {
            action.setUndone(false);
        }

        log.info(
            "Processing {} for action type: {} (actionId: {})",
            operationType,
            action.getActionType(),
            action.getActionId()
        );

        BoardActionDTO.Response response = processActionByType(action, isUndo);

        if (!isUndo) {
            actionHistoryRepository.save(action);
        }

        if (response != null) {
            broadcastToBoard(boardId, response);
        }

        return response;
    }

    /**
     * Routes action processing based on action type. Delegates to specific handler methods for add,
     * update, or delete actions.
     *
     * @param action The action history record to process
     * @param isUndo true for undo operation, false for redo
     * @return BoardActionDTO.Response containing the processed action, or null for unsupported
     *         types
     */
    private BoardActionDTO.Response processActionByType(ActionHistory action, boolean isUndo) {
        switch (action.getActionType()) {
            case OBJECT_ADD_ACTION:
                return processAddAction(action, isUndo);
            case OBJECT_UPDATE_ACTION:
                return processUpdateAction(action, isUndo);
            case OBJECT_DELETE_ACTION:
                return processDeleteAction(action, isUndo);
            default:
                log.warn("Unsupported action type for {}: {}", isUndo ? "undo" : "redo", action.getActionType());
                return null;
        }
    }

    /**
     * Validates if a user is a member of the specified board.
     *
     * @param boardId The ID of the board
     * @param userEmail The email of the user to validate
     * @return true if the user is a member of the board, false otherwise
     */
    private boolean isUserMember(Long boardId, String userEmail) {
        return groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId);
    }

    /**
     * Broadcasts action response to all members of the specified board via WebSocket.
     *
     * @param boardId The ID of the board to broadcast to
     * @param response The response to broadcast
     */
    private void broadcastToBoard(Long boardId, BoardActionDTO.Response response) {
        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + boardId;
        messagingTemplate.convertAndSend(destination, response);
    }

    /**
     * Creates a delete action response for broadcasting object removal.
     *
     * @param instanceId The instance ID of the object being deleted
     * @return BoardActionDTO.Response configured for delete action
     */
    private BoardActionDTO.Response createDeleteResponse(String instanceId) {
        return BoardActionDTO.Response.builder()
            .type(BoardActionDTO.ActionType.OBJECT_DELETE)
            .instanceId(instanceId)
            .sender("system-undo-redo")
            .build();
    }

    /**
     * Parses JSON object data and creates a response for broadcasting.
     *
     * @param jsonData The JSON string containing object data
     * @param actionType The type of action being performed
     * @param instanceId The instance ID of the object
     * @param operation Description of the operation for error reporting
     * @return BoardActionDTO.Response containing parsed data
     * @throws InvalidRequestException if JSON parsing fails
     */
    private BoardActionDTO.Response parseJsonAndCreateResponse(
        String jsonData,
        BoardActionDTO.ActionType actionType,
        String instanceId,
        String operation
    ) {
        try {
            JsonNode payload = objectMapper.readTree(jsonData);
            return BoardActionDTO.Response.builder()
                .type(actionType)
                .instanceId(instanceId)
                .payload(payload)
                .sender("system-undo-redo")
                .build();
        } catch (JsonProcessingException e) {
            log.error("Failed to create {} response: {}", operation, e.getMessage(), e);
            throw new InvalidRequestException(operation + " operation failed due to corrupted data");
        }
    }
}
