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
        ActionHistory lastAction = actionHistoryRepository
                .findTopByBoard_BoardGroupIdAndIsUndoneFalseOrderByTimestampDesc(boardId)
                .orElse(null);

        if (lastAction == null) {
            log.info("No active actions to undo for boardId: {}", boardId);
            return null;
        }

        return processUndoRedoAction(boardId, userEmail, lastAction, true, "undo");
    }

    @Transactional
    public BoardActionDTO.Response redoLastAction(Long boardId, String userEmail) {
        ActionHistory lastUndoneAction = actionHistoryRepository
                .findTopByBoard_BoardGroupIdAndIsUndoneTrueOrderByTimestampDesc(boardId)
                .orElse(null);

        if (lastUndoneAction == null) {
            log.info("No undone actions to redo for boardId: {}", boardId);
            return null;
        }

        return processUndoRedoAction(boardId, userEmail, lastUndoneAction, false, "redo");
    }

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
            return parseJsonAndCreateResponse(persistedObject.getObjectData(), 
                    BoardActionDTO.ActionType.OBJECT_ADD, persistedObject.getInstanceId(), "redo add");
        }
    }

    private BoardActionDTO.Response processUpdateAction(ActionHistory action, boolean isUndo) {
        log.info("Handling {} update for object instanceId: {}", 
                isUndo ? "undo" : "redo", action.getBoardObject().getInstanceId());
        
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

        return parseJsonAndCreateResponse(targetState, BoardActionDTO.ActionType.OBJECT_UPDATE, 
                persistedObject.getInstanceId(), isUndo ? "undo update" : "redo update");
    }

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
                return parseJsonAndCreateResponse(persistedObject.getObjectData(), 
                        BoardActionDTO.ActionType.OBJECT_ADD, persistedObject.getInstanceId(), "undo delete");
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

    private BoardActionDTO.Response processUndoRedoAction(Long boardId, String userEmail, 
            ActionHistory action, boolean isUndo, String operationType) {
        if (!isUserMember(boardId, userEmail)) {
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }

        // Update action state
        if (isUndo) {
            action.setUndone(true);
            actionHistoryRepository.save(action);
        } else {
            action.setUndone(false);
        }

        log.info("Processing {} for action type: {} (actionId: {})", 
                operationType, action.getActionType(), action.getActionId());

        BoardActionDTO.Response response = processActionByType(action, isUndo);

        // Save action state for redo (undo already saved above)
        if (!isUndo) {
            actionHistoryRepository.save(action);
        }

        if (response != null) {
            broadcastToBoard(boardId, response);
        }

        return response;
    }

    private BoardActionDTO.Response processActionByType(ActionHistory action, boolean isUndo) {
        switch (action.getActionType()) {
            case OBJECT_ADD_ACTION:
                return processAddAction(action, isUndo);
            case OBJECT_UPDATE_ACTION:
                return processUpdateAction(action, isUndo);
            case OBJECT_DELETE_ACTION:
                return processDeleteAction(action, isUndo);
            default:
                log.warn("Unsupported action type for {}: {}", 
                        isUndo ? "undo" : "redo", action.getActionType());
                return null;
        }
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

    private BoardActionDTO.Response parseJsonAndCreateResponse(String jsonData, 
            BoardActionDTO.ActionType actionType, String instanceId, String operation) {
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
            throw new InvalidRequestException(
                    operation + " operation failed due to corrupted data");
        }
    }
}
