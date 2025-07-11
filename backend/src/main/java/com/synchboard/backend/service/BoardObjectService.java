// File: backend/src/main/java/com/synchboard/backend/service/BoardObjectService.java
package com.synchboard.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synchboard.backend.dto.websocket.BoardActionDTO;
import com.synchboard.backend.dto.websocket.BoardActionDTO.ActionType;
import com.synchboard.backend.entity.BoardObject;
import com.synchboard.backend.entity.GroupBoard;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.repository.BoardObjectRepository;
import com.synchboard.backend.repository.GroupBoardRepository;
import com.synchboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * Service class for managing board objects.
 * Handles saving and retrieving drawing actions on the board.
 */
@Service
@RequiredArgsConstructor
public class BoardObjectService {

    private final BoardObjectRepository boardObjectRepository;
    private final UserRepository userRepository;
    private final GroupBoardRepository groupBoardRepository;
    private final ObjectMapper objectMapper;

    /**
     * Saves a drawing action from a user to the database.
     *
     * @param request   the board action DTO containing the action details.
     * @param userEmail the email of the user who performed the action.
     */
    @Transactional
    public void saveDrawAction(BoardActionDTO.Request request, String userEmail) {
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + userEmail));
        GroupBoard board = groupBoardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new RuntimeException(BOARD_NOT_FOUND + request.getBoardId()));

        // In a real application, you would handle different action types (ADD, UPDATE,
        // DELETE)
        // This implementation currently only handles adding new objects.
        try {
            String payloadAsString = objectMapper.writeValueAsString(request.getPayload());
            BoardObject boardObject = BoardObject.builder()
                    .board(board)
                    .createdByUser(user)
                    .lastEditedByUser(user)
                    .objectType(request.getType().name())
                    .objectData(payloadAsString)
                    .build();
            boardObjectRepository.save(boardObject);
        } catch (JsonProcessingException e) {
        }
    }

    /**
     * Retrieves all board objects for a specific board.
     *
     * @param boardId the ID of the board.
     * @return a list of board action response DTOs.
     */
    @Transactional(readOnly = true)
    public List<BoardActionDTO.Response> getObjectsForBoard(Long boardId) {
        List<BoardObject> boardObjects = boardObjectRepository.findAllByBoard_BoardGroupId(boardId);

        return boardObjects.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Maps a BoardObject entity to a BoardActionDTO.Response DTO.
     *
     * @param entity the BoardObject entity to map.
     * @return the corresponding BoardActionDTO.Response, or null on failure.
     */
    private BoardActionDTO.Response mapEntityToResponse(BoardObject entity) {
        try {
            JsonNode payload = objectMapper.readTree(entity.getObjectData());

            return BoardActionDTO.Response.builder()
                    .type(ActionType.valueOf(entity.getObjectType()))
                    .payload(payload)
                    .sender(entity.getCreatedByUser().getEmail())
                    // The instanceId is client-specific and not stored in the entity, so it's null
                    // here.
                    // This might need adjustment based on application logic (e.g., if IDs are
                    // stored in the payload).
                    .build();

        } catch (JsonProcessingException e) {
            return null;
        }
    }
}