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
            undoResponse = processAddAction(lastAction, true);
        } else if (OBJECT_UPDATE_ACTION.equals(lastAction.getActionType())) {
            undoResponse = processUpdateAction(lastAction, true);
        } else if (OBJECT_DELETE_ACTION.equals(lastAction.getActionType())) {
            undoResponse = processDeleteAction(lastAction, true);
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
            redoResponse = processAddAction(lastUndoneAction, false);
        } else if (OBJECT_UPDATE_ACTION.equals(lastUndoneAction.getActionType())) {
            redoResponse = processUpdateAction(lastUndoneAction, false);
        } else if (OBJECT_DELETE_ACTION.equals(lastUndoneAction.getActionType())) {
            redoResponse = processDeleteAction(lastUndoneAction, false);
        } else {
            log.warn("Unsupported action type for redo: {}", lastUndoneAction.getActionType());
        }

        actionHistoryRepository.save(lastUndoneAction);

        if (redoResponse != null) {
            broadcastToBoard(boardId, redoResponse);
        }

        return redoResponse;
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
