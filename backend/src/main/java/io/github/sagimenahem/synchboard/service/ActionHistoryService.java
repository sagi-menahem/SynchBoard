package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.ActionConstants.OBJECT_ADD_ACTION;
import static io.github.sagimenahem.synchboard.constants.ActionConstants.OBJECT_UPDATE_ACTION;
import static io.github.sagimenahem.synchboard.constants.ActionConstants.OBJECT_DELETE_ACTION;
import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class ActionHistoryService {

    private final ActionHistoryRepository actionHistoryRepository;
    private final BoardObjectRepository boardObjectRepository;
    private final SimpMessageSendingOperations messagingTemplate;
    private final GroupMemberRepository groupMemberRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public BoardActionDTO.Response undoLastAction(Long boardId, String userEmail) {
        if (!isUserMember(boardId, userEmail)) {
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }

        ActionHistory lastAction = actionHistoryRepository
                .findTopByBoard_BoardGroupIdAndIsUndoneFalseOrderByTimestampDesc(boardId)
                .orElse(null);

        if (lastAction == null) {
            log.info("No active actions to undo for boardId: {}", boardId);
            return null;
        }

        lastAction.setUndone(true);
        actionHistoryRepository.save(lastAction);

        BoardActionDTO.Response undoResponse = null;
        log.info("Processing undo for action type: {} (actionId: {})", 
                lastAction.getActionType(), lastAction.getActionId());
        
        if (OBJECT_ADD_ACTION.equals(lastAction.getActionType())) {
            undoResponse = handleUndoAdd(lastAction);
        } else if (OBJECT_UPDATE_ACTION.equals(lastAction.getActionType())) {
            undoResponse = handleUndoUpdate(lastAction);
        } else if (OBJECT_DELETE_ACTION.equals(lastAction.getActionType())) {
            undoResponse = handleUndoDelete(lastAction);
        } else {
            log.warn("Unsupported action type for undo: {}", lastAction.getActionType());
        }

        if (undoResponse != null) {
            broadcastToBoard(boardId, undoResponse);
        }

        return undoResponse;
    }

    @Transactional
    public BoardActionDTO.Response redoLastAction(Long boardId, String userEmail) {
        if (!isUserMember(boardId, userEmail)) {
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }

        ActionHistory lastUndoneAction = actionHistoryRepository
                .findTopByBoard_BoardGroupIdAndIsUndoneTrueOrderByTimestampDesc(boardId)
                .orElse(null);

        if (lastUndoneAction == null) {
            log.info("No undone actions to redo for boardId: {}", boardId);
            return null;
        }

        lastUndoneAction.setUndone(false);

        BoardActionDTO.Response redoResponse = null;
        log.info("Processing redo for action type: {} (actionId: {})", 
                lastUndoneAction.getActionType(), lastUndoneAction.getActionId());
        
        if (OBJECT_ADD_ACTION.equals(lastUndoneAction.getActionType())) {
            redoResponse = handleRedoAdd(lastUndoneAction);
        } else if (OBJECT_UPDATE_ACTION.equals(lastUndoneAction.getActionType())) {
            redoResponse = handleRedoUpdate(lastUndoneAction);
        } else if (OBJECT_DELETE_ACTION.equals(lastUndoneAction.getActionType())) {
            redoResponse = handleRedoDelete(lastUndoneAction);
        } else {
            log.warn("Unsupported action type for redo: {}", lastUndoneAction.getActionType());
        }

        actionHistoryRepository.save(lastUndoneAction);

        if (redoResponse != null) {
            broadcastToBoard(boardId, redoResponse);
        }

        return redoResponse;
    }

    private BoardActionDTO.Response handleUndoAdd(ActionHistory actionToUndo) {
        BoardObject objectToDeactivate = actionToUndo.getBoardObject();
        if (objectToDeactivate != null) {
            objectToDeactivate.setActive(false);
            boardObjectRepository.save(objectToDeactivate);

            return createDeleteResponse(objectToDeactivate.getInstanceId());
        }
        return null;
    }

    private BoardActionDTO.Response handleRedoAdd(ActionHistory actionToRedo) {
        BoardObject objectToReactivate = actionToRedo.getBoardObject();
        if (objectToReactivate != null) {
            objectToReactivate.setActive(true);
            BoardObject persistedObject = boardObjectRepository.save(objectToReactivate);

            try {
                return createAddResponse(persistedObject);
            } catch (JsonProcessingException e) {
                log.error("Failed to create redo response for board object {}: {}",
                        persistedObject.getObjectId(), e.getMessage(), e);
                throw new InvalidRequestException(
                        "Redo operation failed due to corrupted board data");
            }
        }
        return null;
    }

    private BoardActionDTO.Response handleUndoUpdate(ActionHistory actionToUndo) {
        log.info("Handling undo update for object instanceId: {}", 
                actionToUndo.getBoardObject().getInstanceId());
        BoardObject objectToRevert = actionToUndo.getBoardObject();
        if (objectToRevert != null && objectToRevert.isActive()) {
            try {
                // Restore the object to its previous state
                String previousState = actionToUndo.getStateBefore();
                if (previousState != null) {
                    objectToRevert.setObjectData(previousState);
                    objectToRevert.setLastEditedByUser(actionToUndo.getUser());
                    BoardObject persistedObject = boardObjectRepository.save(objectToRevert);

                    // Create OBJECT_UPDATE response with previous state
                    JsonNode payload = objectMapper.readTree(previousState);
                    return BoardActionDTO.Response.builder()
                            .type(BoardActionDTO.ActionType.OBJECT_UPDATE)
                            .instanceId(persistedObject.getInstanceId())
                            .payload(payload)
                            .sender("system-undo-redo")
                            .build();
                }
            } catch (JsonProcessingException e) {
                log.error("Failed to undo update for board object {}: {}",
                        objectToRevert.getObjectId(), e.getMessage(), e);
                throw new InvalidRequestException(
                        "Undo operation failed due to corrupted state data");
            }
        }
        return null;
    }

    private BoardActionDTO.Response handleRedoUpdate(ActionHistory actionToRedo) {
        log.info("Handling redo update for object instanceId: {}", 
                actionToRedo.getBoardObject().getInstanceId());
        BoardObject objectToReapply = actionToRedo.getBoardObject();
        if (objectToReapply != null && objectToReapply.isActive()) {
            try {
                // Reapply the updated state
                String newState = actionToRedo.getStateAfter();
                if (newState != null) {
                    objectToReapply.setObjectData(newState);
                    objectToReapply.setLastEditedByUser(actionToRedo.getUser());
                    BoardObject persistedObject = boardObjectRepository.save(objectToReapply);

                    // Create OBJECT_UPDATE response with new state
                    JsonNode payload = objectMapper.readTree(newState);
                    return BoardActionDTO.Response.builder()
                            .type(BoardActionDTO.ActionType.OBJECT_UPDATE)
                            .instanceId(persistedObject.getInstanceId())
                            .payload(payload)
                            .sender("system-undo-redo")
                            .build();
                }
            } catch (JsonProcessingException e) {
                log.error("Failed to redo update for board object {}: {}",
                        objectToReapply.getObjectId(), e.getMessage(), e);
                throw new InvalidRequestException(
                        "Redo operation failed due to corrupted state data");
            }
        }
        return null;
    }

    private BoardActionDTO.Response handleUndoDelete(ActionHistory actionToUndo) {
        BoardObject objectToRestore = actionToUndo.getBoardObject();
        if (objectToRestore != null && !objectToRestore.isActive()) {
            // Reactivate the deleted object
            objectToRestore.setActive(true);
            objectToRestore.setLastEditedByUser(actionToUndo.getUser());
            BoardObject persistedObject = boardObjectRepository.save(objectToRestore);

            try {
                // Create OBJECT_ADD response to restore the object
                JsonNode payload = objectMapper.readTree(persistedObject.getObjectData());
                return BoardActionDTO.Response.builder()
                        .type(BoardActionDTO.ActionType.OBJECT_ADD)
                        .instanceId(persistedObject.getInstanceId())
                        .payload(payload)
                        .sender("system-undo-redo")
                        .build();
            } catch (JsonProcessingException e) {
                log.error("Failed to undo delete for board object {}: {}",
                        persistedObject.getObjectId(), e.getMessage(), e);
                throw new InvalidRequestException(
                        "Undo delete operation failed due to corrupted object data");
            }
        }
        return null;
    }

    private BoardActionDTO.Response handleRedoDelete(ActionHistory actionToRedo) {
        BoardObject objectToDelete = actionToRedo.getBoardObject();
        if (objectToDelete != null && objectToDelete.isActive()) {
            // Deactivate the object again
            objectToDelete.setActive(false);
            objectToDelete.setLastEditedByUser(actionToRedo.getUser());
            boardObjectRepository.save(objectToDelete);

            // Create OBJECT_DELETE response
            return createDeleteResponse(objectToDelete.getInstanceId());
        }
        return null;
    }

    private boolean isUserMember(Long boardId, String userEmail) {
        return groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId);
    }

    private void broadcastToBoard(Long boardId, BoardActionDTO.Response response) {
        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + boardId;
        messagingTemplate.convertAndSend(destination, response);
    }

    private BoardActionDTO.Response createDeleteResponse(String instanceId) {
        return BoardActionDTO.Response.builder().type(BoardActionDTO.ActionType.OBJECT_DELETE)
                .instanceId(instanceId).sender("system-undo-redo").build();
    }

    private BoardActionDTO.Response createAddResponse(BoardObject boardObject)
            throws JsonProcessingException {
        JsonNode payload = objectMapper.readTree(boardObject.getObjectData());
        return BoardActionDTO.Response.builder().type(BoardActionDTO.ActionType.OBJECT_ADD)
                .instanceId(boardObject.getInstanceId()).payload(payload).sender("system-undo-redo")
                .build();
    }
}
