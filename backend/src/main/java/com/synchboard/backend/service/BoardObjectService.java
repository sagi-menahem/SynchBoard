// File: backend/src/main/java/com/synchboard/backend/service/BoardObjectService.java
package com.synchboard.backend.service;

import static com.synchboard.backend.config.constants.FileConstants.DEFAULT_SENDER_EMAIL;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synchboard.backend.config.constants.MessageConstants;
import com.synchboard.backend.dto.websocket.BoardActionDTO;
import com.synchboard.backend.dto.websocket.BoardActionDTO.ActionType;
import com.synchboard.backend.entity.ActionHistory;
import com.synchboard.backend.entity.BoardObject;
import com.synchboard.backend.entity.GroupBoard;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.exception.ResourceNotFoundException;
import com.synchboard.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardObjectService {

    private final BoardObjectRepository boardObjectRepository;
    private final UserRepository userRepository;
    private final GroupBoardRepository groupBoardRepository;
    private final ObjectMapper objectMapper;
    private final ActionHistoryRepository actionHistoryRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Transactional
    public void saveDrawAction(BoardActionDTO.Request request, String userEmail) {

        if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail,
                request.getBoardId())) {
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }

        User user = userRepository.findById(userEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        GroupBoard board = groupBoardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        MessageConstants.BOARD_NOT_FOUND + request.getBoardId()));

        if (request.getType() == ActionType.OBJECT_ADD) {
            try {
                String payloadAsString = objectMapper.writeValueAsString(request.getPayload());

                BoardObject newBoardObject = BoardObject.builder().board(board).createdByUser(user)
                        .lastEditedByUser(user).objectType(request.getType().name())
                        .objectData(payloadAsString).instanceId(request.getInstanceId()).build();

                BoardObject persistedBoardObject =
                        boardObjectRepository.saveAndFlush(newBoardObject);

                ActionHistory historyRecord = ActionHistory.builder().board(board).user(user)
                        .boardObject(persistedBoardObject).actionType(request.getType().name())
                        .stateBefore(null).stateAfter(payloadAsString).build();

                actionHistoryRepository.save(historyRecord);

            } catch (JsonProcessingException e) {
                log.error("Failed to process JSON payload for board action", e);
                throw new RuntimeException("Failed to process JSON for board action.", e);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<BoardActionDTO.Response> getObjectsForBoard(Long boardId, String userEmail) {
        if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }

        List<BoardObject> boardObjects =
                boardObjectRepository.findAllByBoard_BoardGroupIdAndIsActiveTrue(boardId);

        return boardObjects.stream().map(this::mapEntityToResponse).collect(Collectors.toList());
    }

    private BoardActionDTO.Response mapEntityToResponse(BoardObject entity) {
        try {
            JsonNode payload = objectMapper.readTree(entity.getObjectData());

            String senderEmail = DEFAULT_SENDER_EMAIL;
            if (entity.getCreatedByUser() != null) {
                senderEmail = entity.getCreatedByUser().getEmail();
            }

            return BoardActionDTO.Response.builder()
                    .type(ActionType.valueOf(entity.getObjectType())).payload(payload)
                    .sender(senderEmail).instanceId(entity.getInstanceId()).build();
        } catch (JsonProcessingException e) {
            log.error("Failed to parse BoardObject JSON data for object ID: {}",
                    entity.getObjectId(), e);
            return null;
        }
    }
}
