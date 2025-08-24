package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.*;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.dto.board.*;
import io.github.sagimenahem.synchboard.dto.websocket.BoardActionDTO;
import io.github.sagimenahem.synchboard.dto.websocket.ChatMessageDTO;
import io.github.sagimenahem.synchboard.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping(API_BOARDS_BASE_PATH)
@RequiredArgsConstructor
public class GroupBoardController {

        private final BoardService boardService;
        private final BoardMemberService boardMemberService;
        private final BoardObjectService boardObjectService;
        private final ActionHistoryService actionHistoryService;
        private final ChatService chatService;

        @GetMapping
        public ResponseEntity<List<BoardDTO>> getBoardsForCurrentUser(
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(API_REQUEST_RECEIVED, "GET", API_BOARDS_BASE_PATH, userEmail);

                List<BoardDTO> boards = boardService.getBoardsForUser(userEmail);
                log.info(DATA_PREFIX + " Retrieved {} boards for user: {}", boards.size(),
                                userEmail);
                return ResponseEntity.ok(boards);
        }

        @PostMapping
        public ResponseEntity<BoardDTO> createBoard(@Valid @ModelAttribute CreateBoardRequest request,
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.info(API_REQUEST_RECEIVED, "POST", API_BOARDS_BASE_PATH, userEmail);

                BoardDTO newBoard = boardService.createBoard(request, userEmail);
                log.info(BOARD_CREATED, newBoard.getId(), request.getName(), userEmail);
                return new ResponseEntity<>(newBoard, HttpStatus.CREATED);
        }

        @GetMapping(API_BOARDS_DETAILS)
        public ResponseEntity<BoardDetailsDTO> getBoardDetails(
                        @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        Authentication authentication) {

                String userEmail = authentication.getName();
                log.info(BOARD_ACCESS_ATTEMPT, boardId, userEmail);

                BoardDetailsDTO boardDetails = boardService.getBoardDetails(boardId, userEmail);
                log.info(BOARD_ACCESS_GRANTED, boardId, userEmail);
                return ResponseEntity.ok(boardDetails);
        }

        @GetMapping(API_BOARDS_OBJECT)
        public ResponseEntity<List<BoardActionDTO.Response>> getBoardObjects(
                        @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(DATA_PREFIX + " Fetching board objects. BoardId: {}, User: {}", boardId,
                                userEmail);

                List<BoardActionDTO.Response> objects =
                                boardObjectService.getObjectsForBoard(boardId, userEmail);
                log.debug(DATA_PREFIX + " Retrieved {} objects for board: {}", objects.size(),
                                boardId);
                return ResponseEntity.ok(objects);
        }

        @PostMapping(API_BOARDS_MEMBERS)
        public ResponseEntity<MemberDTO> inviteMember(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        @Valid @RequestBody InviteRequest request, Authentication authentication) {

                String invitingUserEmail = authentication.getName();
                log.info(SECURITY_PREFIX
                                + " Member invitation attempt. BoardId: {}, InvitedEmail: {}, InvitedBy: {}",
                                boardId, request.getEmail(), invitingUserEmail);

                MemberDTO newMember = boardMemberService.inviteMember(boardId, request.getEmail(),
                                invitingUserEmail);
                log.info(BOARD_MEMBER_ADDED, boardId, request.getEmail(), invitingUserEmail);
                return new ResponseEntity<>(newMember, HttpStatus.CREATED);
        }

        @DeleteMapping(API_BOARDS_MEMBERS_REMOVE)
        public ResponseEntity<?> removeMember(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        @PathVariable(PATH_VAR_MEMBER_EMAIL) String memberEmail,
                        Authentication authentication) {

                String requestingUserEmail = authentication.getName();
                log.warn(SECURITY_PREFIX
                                + " Member removal attempt. BoardId: {}, MemberEmail: {}, RequestedBy: {}",
                                boardId, memberEmail, requestingUserEmail);

                boardMemberService.removeMember(boardId, memberEmail, requestingUserEmail);
                log.info(BOARD_MEMBER_REMOVED, boardId, memberEmail, requestingUserEmail);
                return ResponseEntity.ok().build();
        }

        @DeleteMapping(API_BOARDS_MEMBERS_LEAVE)
        public ResponseEntity<?> leaveBoard(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        Authentication authentication) {

                String userEmail = authentication.getName();
                log.info(AUDIT_PREFIX + " User leaving board. BoardId: {}, User: {}", boardId,
                                userEmail);

                boardMemberService.leaveBoard(boardId, userEmail);
                log.info(BOARD_MEMBER_LEFT, boardId, userEmail);
                return ResponseEntity.ok().build();
        }

        @PutMapping(API_BOARDS_MEMBERS_PROMOTE)
        public ResponseEntity<MemberDTO> promoteMember(
                        @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        @PathVariable(PATH_VAR_MEMBER_EMAIL) String memberEmail,
                        Authentication authentication) {

                String requestingUserEmail = authentication.getName();
                log.info(SECURITY_PREFIX
                                + " Member promotion attempt. BoardId: {}, Member: {}, RequestedBy: {}",
                                boardId, memberEmail, requestingUserEmail);

                MemberDTO updatedMember = boardMemberService.promoteMember(boardId, memberEmail,
                                requestingUserEmail);
                log.info(BOARD_MEMBER_PROMOTED, boardId, memberEmail, requestingUserEmail);
                return ResponseEntity.ok(updatedMember);
        }

        @PostMapping(API_BOARDS_UNDO)
        public ResponseEntity<?> undoLastAction(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(AUDIT_PREFIX + " Undo action requested. BoardId: {}, User: {}", boardId,
                                userEmail);

                BoardActionDTO.Response undoResult =
                                actionHistoryService.undoLastAction(boardId, userEmail);
                if (undoResult != null) {
                        log.info(ACTION_UNDO, boardId, userEmail, undoResult.getType());
                        return ResponseEntity.ok(undoResult);
                } else {
                        log.debug(AUDIT_PREFIX + " No action to undo. BoardId: {}, User: {}",
                                        boardId, userEmail);
                        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
                }
        }

        @PostMapping(API_BOARDS_REDO)
        public ResponseEntity<?> redoLastAction(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(AUDIT_PREFIX + " Redo action requested. BoardId: {}, User: {}", boardId,
                                userEmail);

                BoardActionDTO.Response redoResult =
                                actionHistoryService.redoLastAction(boardId, userEmail);
                if (redoResult != null) {
                        log.info(ACTION_REDO, boardId, userEmail, redoResult.getType());
                        return ResponseEntity.ok(redoResult);
                } else {
                        log.debug(AUDIT_PREFIX + " No action to redo. BoardId: {}, User: {}",
                                        boardId, userEmail);
                        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
                }
        }

        @PutMapping(API_BOARDS_NAME)
        public ResponseEntity<BoardDTO> updateBoardName(
                        @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        @Valid @RequestBody UpdateBoardNameRequest request,
                        Authentication authentication) {

                String userEmail = authentication.getName();
                log.info(AUDIT_PREFIX + " Board name update. BoardId: {}, NewName: {}, User: {}",
                                boardId, request.getName(), userEmail);

                BoardDTO updatedBoard =
                                boardService.updateBoardName(boardId, request.getName(), userEmail);
                log.info(BOARD_UPDATED, boardId, "name", userEmail);
                return ResponseEntity.ok(updatedBoard);
        }

        @PutMapping(API_BOARDS_DESCRIPTION)
        public ResponseEntity<BoardDTO> updateBoardDescription(
                        @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        @Valid @RequestBody UpdateBoardDescriptionRequest request,
                        Authentication authentication) {

                String userEmail = authentication.getName();
                log.info(AUDIT_PREFIX + " Board description update. BoardId: {}, User: {}", boardId,
                                userEmail);

                BoardDTO updatedBoard = boardService.updateBoardDescription(boardId,
                                request.getDescription(), userEmail);
                log.info(BOARD_UPDATED, boardId, "description", userEmail);
                return ResponseEntity.ok(updatedBoard);
        }

        @PostMapping(API_BOARDS_PICTURE)
        public ResponseEntity<BoardDTO> uploadBoardPicture(
                        @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        @RequestParam(REQUEST_PARAM_FILE) MultipartFile file,
                        Authentication authentication) {

                String userEmail = authentication.getName();
                log.info(FILE_UPLOAD_STARTED, file.getOriginalFilename(), userEmail,
                                file.getSize());

                BoardDTO updatedBoard = boardService.updateBoardPicture(boardId, file, userEmail);
                log.info(BOARD_UPDATED, boardId, "picture", userEmail);
                return ResponseEntity.ok(updatedBoard);
        }

        @DeleteMapping(API_BOARDS_PICTURE)
        public ResponseEntity<BoardDTO> deleteBoardPicture(
                        @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        Authentication authentication) {

                String userEmail = authentication.getName();
                log.info(FILE_PREFIX + " Board picture deletion. BoardId: {}, User: {}", boardId,
                                userEmail);

                BoardDTO updatedBoard = boardService.deleteBoardPicture(boardId, userEmail);
                log.info(BOARD_UPDATED, boardId, "picture removed", userEmail);
                return ResponseEntity.ok(updatedBoard);
        }

        @GetMapping(API_BOARDS_MESSAGES)
        public ResponseEntity<List<ChatMessageDTO.Response>> getBoardMessages(
                        @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(DATA_PREFIX + " Fetching messages for board: {}, User: {}", boardId,
                                userEmail);

                List<ChatMessageDTO.Response> messages =
                                chatService.getMessagesForBoard(boardId, userEmail);
                log.debug(DATA_PREFIX + " Retrieved {} messages for board: {}", messages.size(),
                                boardId);
                return ResponseEntity.ok(messages);
        }

        @PutMapping(API_BOARDS_CANVAS_SETTINGS)
        public ResponseEntity<BoardDTO> updateCanvasSettings(
                        @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        @Valid @RequestBody UpdateCanvasSettingsRequest request,
                        Authentication authentication) {

                String userEmail = authentication.getName();
                log.info(AUDIT_PREFIX + " Canvas settings update. BoardId: {}, User: {}", boardId,
                                userEmail);

                BoardDTO updatedBoard = boardService.updateCanvasSettings(boardId, request, userEmail);
                log.info(BOARD_UPDATED, boardId, "canvas settings", userEmail);
                return ResponseEntity.ok(updatedBoard);
        }
}
