package io.github.sagimenahem.synchboard.service.board;

import static io.github.sagimenahem.synchboard.constants.FileConstants.DEFAULT_SENDER_EMAIL;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.websocket.BoardActionDTO;
import io.github.sagimenahem.synchboard.dto.websocket.BoardActionDTO.ActionType;
import io.github.sagimenahem.synchboard.entity.ActionHistory;
import io.github.sagimenahem.synchboard.entity.BoardObject;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.*;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing board drawing objects and canvas state persistence. Handles saving,
 * retrieving, and managing drawing actions on collaborative boards, with support for object
 * serialization and board access validation.
 *
 * @author Sagi Menahem
 */
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
        validateBoardAccess(userEmail, request.getBoardId());

        User user = userRepository
            .findById(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        GroupBoard board = groupBoardRepository
            .findById(request.getBoardId())
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.BOARD_NOT_FOUND + request.getBoardId()));

        try {
            String payloadAsString = objectMapper.writeValueAsString(request.getPayload());

            switch (request.getType()) {
                case OBJECT_ADD:
                    handleObjectAdd(request, board, user, payloadAsString);
                    break;
                case OBJECT_UPDATE:
                    handleObjectUpdate(request, board, user, payloadAsString);
                    break;
                case OBJECT_DELETE:
                    handleObjectDelete(request, board, user);
                    break;
                default:
                    throw new InvalidRequestException("Unsupported action type: " + request.getType());
            }
        } catch (JacksonException e) {
            log.error(
                "Failed to process JSON payload for board action on board {}: {}",
                request.getBoardId(),
                e.getMessage(),
                e
            );
            throw new InvalidRequestException("Invalid board action data format: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<BoardActionDTO.Response> getObjectsForBoard(Long boardId, String userEmail) {
        validateBoardAccess(userEmail, boardId);

        List<BoardObject> boardObjects = boardObjectRepository.findActiveByBoardWithUsers(boardId);

        return boardObjects.stream().map(this::mapEntityToResponse).collect(Collectors.toList());
    }

    private void handleObjectAdd(BoardActionDTO.Request request, GroupBoard board, User user, String payloadAsString) {
        BoardObject newBoardObject = BoardObject.builder()
            .board(board)
            .createdByUser(user)
            .lastEditedByUser(user)
            .objectType(request.getType().name())
            .objectData(payloadAsString)
            .instanceId(request.getInstanceId())
            .build();

        BoardObject persistedBoardObject = boardObjectRepository.saveAndFlush(newBoardObject);
        createActionHistory(board, user, persistedBoardObject, request.getType(), null, payloadAsString);
    }

    private void handleObjectUpdate(
        BoardActionDTO.Request request,
        GroupBoard board,
        User user,
        String payloadAsString
    ) {
        log.debug(
            "OBJECT_UPDATE: Searching for instanceId: {} in board: {}",
            request.getInstanceId(),
            board.getBoardGroupId()
        );

        BoardObject existingObject = boardObjectRepository
            .findByInstanceIdAndBoardAndIsActive(request.getInstanceId(), board, true)
            .orElseThrow(() -> {
                log.error(
                    "OBJECT_UPDATE: BoardObject not found - instanceId: {}, boardId: {}",
                    request.getInstanceId(),
                    board.getBoardGroupId()
                );
                return new ResourceNotFoundException(
                    "BoardObject not found with instanceId: " + request.getInstanceId()
                );
            });

        String previousPayload = existingObject.getObjectData();
        existingObject.setObjectData(payloadAsString);
        existingObject.setLastEditedByUser(user);

        boardObjectRepository.saveAndFlush(existingObject);
        createActionHistory(board, user, existingObject, request.getType(), previousPayload, payloadAsString);
    }

    private void handleObjectDelete(BoardActionDTO.Request request, GroupBoard board, User user) {
        BoardObject objectToDelete = boardObjectRepository
            .findByInstanceIdAndBoardAndIsActive(request.getInstanceId(), board, true)
            .orElseThrow(() ->
                new ResourceNotFoundException("BoardObject not found with instanceId: " + request.getInstanceId())
            );

        String previousPayload = objectToDelete.getObjectData();
        objectToDelete.setActive(false);
        objectToDelete.setLastEditedByUser(user);

        boardObjectRepository.saveAndFlush(objectToDelete);
        createActionHistory(board, user, objectToDelete, request.getType(), previousPayload, null);
    }

    private void createActionHistory(
        GroupBoard board,
        User user,
        BoardObject boardObject,
        ActionType actionType,
        String stateBefore,
        String stateAfter
    ) {
        ActionHistory historyRecord = ActionHistory.builder()
            .board(board)
            .user(user)
            .boardObject(boardObject)
            .actionType(actionType.name())
            .stateBefore(stateBefore)
            .stateAfter(stateAfter)
            .build();

        actionHistoryRepository.save(historyRecord);
    }

    private BoardActionDTO.Response mapEntityToResponse(BoardObject entity) {
        try {
            JsonNode payload = objectMapper.readTree(entity.getObjectData());

            String senderEmail = DEFAULT_SENDER_EMAIL;
            if (entity.getCreatedByUser() != null) {
                senderEmail = entity.getCreatedByUser().getEmail();
            }

            return BoardActionDTO.Response.builder()
                .type(ActionType.valueOf(entity.getObjectType()))
                .payload(payload)
                .sender(senderEmail)
                .instanceId(entity.getInstanceId())
                .build();
        } catch (JacksonException | IllegalArgumentException e) {
            log.error("Failed to parse BoardObject data for object ID: {}", entity.getObjectId(), e);
            return BoardActionDTO.Response.builder()
                .type(ActionType.OBJECT_DELETE)
                .payload(null)
                .sender("system-error")
                .instanceId(entity.getInstanceId())
                .build();
        }
    }

    private void validateBoardAccess(String userEmail, Long boardId) {
        if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }
    }
}
