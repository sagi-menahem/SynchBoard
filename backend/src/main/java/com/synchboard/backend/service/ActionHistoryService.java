// File: backend/src/main/java/com/synchboard/backend/service/ActionHistoryService.java
package com.synchboard.backend.service;

import static com.synchboard.backend.config.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;

import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synchboard.backend.config.constants.MessageConstants;
import com.synchboard.backend.dto.websocket.BoardActionDTO;
import com.synchboard.backend.entity.ActionHistory;
import com.synchboard.backend.entity.BoardObject;
import com.synchboard.backend.repository.ActionHistoryRepository;
import com.synchboard.backend.repository.BoardObjectRepository;
import com.synchboard.backend.repository.GroupMemberRepository;

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
        if ("OBJECT_ADD".equals(lastAction.getActionType())) {
            undoResponse = handleUndoAdd(lastAction);
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
        if ("OBJECT_ADD".equals(lastUndoneAction.getActionType())) {
            redoResponse = handleRedoAdd(lastUndoneAction);
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
                log.error("Failed to create redo response", e);
                throw new RuntimeException("Redo failed during response creation.");
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
        return BoardActionDTO.Response.builder()
                .type(BoardActionDTO.ActionType.OBJECT_DELETE)
                .instanceId(instanceId)
                .sender("system-undo-redo")
                .build();
    }

    private BoardActionDTO.Response createAddResponse(BoardObject boardObject) throws JsonProcessingException {
        JsonNode payload = objectMapper.readTree(boardObject.getObjectData());
        return BoardActionDTO.Response.builder()
                .type(BoardActionDTO.ActionType.OBJECT_ADD)
                .instanceId(boardObject.getInstanceId())
                .payload(payload)
                .sender("system-undo-redo")
                .build();
    }
}