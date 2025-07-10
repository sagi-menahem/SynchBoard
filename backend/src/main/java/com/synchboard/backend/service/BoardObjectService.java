// File: backend/src/main/java/com/synchboard/backend/service/BoardObjectService.java

package com.synchboard.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synchboard.backend.dto.websocket.BoardActionResponse;
import com.synchboard.backend.dto.websocket.ActionType; // Import the shared enum
import com.synchboard.backend.dto.websocket.SendBoardActionRequest;
import com.synchboard.backend.entity.BoardObject;
import com.synchboard.backend.entity.GroupBoard;
import com.synchboard.backend.entity.User;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardObjectService {

    private final BoardObjectRepository boardObjectRepository;
    private final UserRepository userRepository;
    private final GroupBoardRepository groupBoardRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void saveDrawAction(SendBoardActionRequest request, String userEmail) {
        // ... (saveDrawAction method remains the same)
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));
        GroupBoard board = groupBoardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new RuntimeException("Board not found: " + request.getBoardId()));
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
            log.info("Successfully saved board object for boardId: {}", request.getBoardId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize payload for board object", e);
        }
    }

    /**
     * Retrieves all saved drawing objects for a given board.
     * 
     * @param boardId The ID of the board.
     * @return A list of DTOs representing the drawing actions.
     */
    @Transactional(readOnly = true)
    public List<BoardActionResponse> getObjectsForBoard(Long boardId) {
        List<BoardObject> boardObjects = boardObjectRepository.findAllByBoard_BoardGroupId(boardId);

        return boardObjects.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to map a BoardObject entity to a BoardActionResponse DTO.
     */
    private BoardActionResponse mapEntityToResponse(BoardObject entity) {
        try {
            // Convert the stored JSON string back to a JsonNode object
            JsonNode payload = objectMapper.readTree(entity.getObjectData());

            return BoardActionResponse.builder()
                    .type(ActionType.valueOf(entity.getObjectType())) // Convert string back to enum
                    .payload(payload)
                    .sender(entity.getCreatedByUser().getEmail())
                    // instanceId is not relevant here as this is for initial load
                    .build();

        } catch (JsonProcessingException e) {
            log.error("Failed to parse objectData for objectId: {}", entity.getObjectId(), e);
            return null; // Or handle error appropriately
        }
    }
}