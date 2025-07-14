// File: backend/src/main/java/com/synchboard/backend/service/BoardObjectService.java
package com.synchboard.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synchboard.backend.dto.websocket.BoardActionDTO;
import com.synchboard.backend.dto.websocket.BoardActionDTO.ActionType;
import com.synchboard.backend.entity.ActionHistory;
import com.synchboard.backend.entity.BoardObject;
import com.synchboard.backend.entity.GroupBoard;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.repository.ActionHistoryRepository;
import com.synchboard.backend.repository.BoardObjectRepository;
import com.synchboard.backend.repository.GroupBoardRepository;
import com.synchboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static com.synchboard.backend.config.ApplicationConstants.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardObjectService {

    private final BoardObjectRepository boardObjectRepository;
    private final UserRepository userRepository;
    private final GroupBoardRepository groupBoardRepository;
    private final ObjectMapper objectMapper;
    private final ActionHistoryRepository actionHistoryRepository;

    @Transactional
    public void saveDrawAction(BoardActionDTO.Request request, String userEmail) {
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + userEmail));
        GroupBoard board = groupBoardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new RuntimeException(BOARD_NOT_FOUND + request.getBoardId()));

        if (request.getType() == ActionType.OBJECT_ADD) {
            try {
                String payloadAsString = objectMapper.writeValueAsString(request.getPayload());

                BoardObject newBoardObject = BoardObject.builder()
                        .board(board)
                        .createdByUser(user)
                        .lastEditedByUser(user)
                        .objectType(request.getType().name())
                        .objectData(payloadAsString)
                        .instanceId(request.getInstanceId())
                        .build();

                // =================================================================
                // THE FINAL FIX:
                // 1. We save and flush the object to the database.
                // 2. We capture the RETURNED entity, which is guaranteed to have the generated
                // ID.
                // =================================================================
                BoardObject persistedBoardObject = boardObjectRepository.saveAndFlush(newBoardObject);

                // 3. We use the 'persistedBoardObject' which now has a non-null ID.
                ActionHistory historyRecord = ActionHistory.builder()
                        .board(board)
                        .user(user)
                        .boardObject(persistedBoardObject) // Use the object returned from the save operation
                        .actionType(request.getType().name())
                        .stateBefore(null)
                        .stateAfter(payloadAsString)
                        .build();

                actionHistoryRepository.save(historyRecord);

            } catch (JsonProcessingException e) {
                log.error("Failed to process JSON payload for board action", e);
                throw new RuntimeException("Failed to process JSON for board action.", e);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<BoardActionDTO.Response> getObjectsForBoard(Long boardId) {
        // Use the new repository method to fetch only active objects
        List<BoardObject> boardObjects = boardObjectRepository.findAllByBoard_BoardGroupIdAndIsActiveTrue(boardId);

        return boardObjects.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    private BoardActionDTO.Response mapEntityToResponse(BoardObject entity) {
        try {
            JsonNode payload = objectMapper.readTree(entity.getObjectData());
            return BoardActionDTO.Response.builder()
                    .type(ActionType.valueOf(entity.getObjectType()))
                    .payload(payload)
                    .sender(entity.getCreatedByUser().getEmail())
                    .instanceId(entity.getInstanceId())
                    .build();
        } catch (JsonProcessingException e) {
            log.error("Failed to parse BoardObject JSON data for object ID: {}", entity.getObjectId(), e);
            return null;
        }
    }
}