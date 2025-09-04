package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.*;
import static io.github.sagimenahem.synchboard.constants.CanvasConstants.DEFAULT_BACKGROUND_COLOR;
import static io.github.sagimenahem.synchboard.constants.CanvasConstants.DEFAULT_CANVAS_HEIGHT;
import static io.github.sagimenahem.synchboard.constants.CanvasConstants.DEFAULT_CANVAS_WIDTH;
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
import io.github.sagimenahem.synchboard.service.board.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for managing collaborative whiteboard operations and board membership. Handles
 * CRUD operations for boards, member management, canvas settings, file uploads, and provides
 * endpoints for collaborative features like undo/redo and chat messages.
 * 
 * @author Sagi Menahem
 */
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

        /**
         * Retrieves all boards accessible to the authenticated user. Returns boards where the user
         * is either owner or member.
         * 
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing list of boards accessible to the user
         */
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

        /**
         * Creates a new collaborative whiteboard with specified settings. Sets default canvas
         * dimensions and background color if not provided in the request.
         * 
         * @param request the board creation details including name, description, and canvas
         *        settings
         * @param authentication the authentication context containing user credentials
         * @param httpRequest the HTTP servlet request for additional context
         * @return ResponseEntity containing the newly created board details
         */
        @PostMapping
        public ResponseEntity<BoardDTO> createBoard(@ModelAttribute CreateBoardRequest request,
                        Authentication authentication, HttpServletRequest httpRequest) {
                String userEmail = authentication.getName();
                log.info(API_REQUEST_RECEIVED, "POST", API_BOARDS_BASE_PATH, userEmail);

                // Apply default canvas settings if not specified in the request
                if (request.getCanvasBackgroundColor() == null) {
                        request.setCanvasBackgroundColor(DEFAULT_BACKGROUND_COLOR);
                }
                if (request.getCanvasWidth() == null) {
                        request.setCanvasWidth(DEFAULT_CANVAS_WIDTH);
                }
                if (request.getCanvasHeight() == null) {
                        request.setCanvasHeight(DEFAULT_CANVAS_HEIGHT);
                }

                BoardDTO newBoard = boardService.createBoard(request, userEmail);
                log.info(BOARD_CREATED, newBoard.getId(), request.getName(), userEmail);
                return new ResponseEntity<>(newBoard, HttpStatus.CREATED);
        }

        /**
         * Retrieves detailed information about a specific board including member list. Validates
         * user access permissions before returning board details.
         * 
         * @param boardId the unique identifier of the board to retrieve
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing comprehensive board details and member information
         */
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

        /**
         * Retrieves all drawing objects and elements for a specific board. Returns canvas objects
         * needed for board state reconstruction and synchronization.
         * 
         * @param boardId the unique identifier of the board whose objects to retrieve
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing list of board objects and drawing elements
         */
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

        /**
         * Invites a new member to join a collaborative board. Validates that the requesting user
         * has permission to invite members.
         * 
         * @param boardId the unique identifier of the board to invite member to
         * @param request the invitation details containing the email of user to invite
         * @param authentication the authentication context containing inviting user credentials
         * @return ResponseEntity containing the newly added member details
         */
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

        /**
         * Removes a member from a collaborative board. Only board owners can remove other members
         * from the board.
         * 
         * @param boardId the unique identifier of the board to remove member from
         * @param memberEmail the email address of the member to remove
         * @param authentication the authentication context containing requesting user credentials
         * @return ResponseEntity with no content on successful removal
         */
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

        /**
         * Allows the authenticated user to leave a collaborative board. Removes the user from board
         * membership and revokes access permissions.
         * 
         * @param boardId the unique identifier of the board to leave
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity with no content on successful board departure
         */
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

        /**
         * Promotes a regular board member to admin status with enhanced permissions. Only board
         * owners can promote members to admin role.
         * 
         * @param boardId the unique identifier of the board for member promotion
         * @param memberEmail the email address of the member to promote
         * @param authentication the authentication context containing requesting user credentials
         * @return ResponseEntity containing updated member details with new role
         */
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

        /**
         * Undoes the last action performed by the user on the specified board. Reverses the most
         * recent drawing or modification action in the user's history.
         * 
         * @param boardId the unique identifier of the board for undo operation
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing the undone action details or no content if nothing to
         *         undo
         */
        @PostMapping(API_BOARDS_UNDO)
        public ResponseEntity<?> undoLastAction(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(AUDIT_PREFIX + " Undo action requested. BoardId: {}, User: {}", boardId,
                                userEmail);

                BoardActionDTO.Response undoResult =
                                actionHistoryService.undoLastAction(boardId, userEmail);
                // Return the undone action details if available, otherwise indicate no content to
                // undo
                if (undoResult != null) {
                        log.info(ACTION_UNDO, boardId, userEmail, undoResult.getType());
                        return ResponseEntity.ok(undoResult);
                } else {
                        log.debug(AUDIT_PREFIX + " No action to undo. BoardId: {}, User: {}",
                                        boardId, userEmail);
                        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
                }
        }

        /**
         * Redoes the last undone action performed by the user on the specified board. Reapplies the
         * most recently undone drawing or modification action.
         * 
         * @param boardId the unique identifier of the board for redo operation
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing the redone action details or no content if nothing to
         *         redo
         */
        @PostMapping(API_BOARDS_REDO)
        public ResponseEntity<?> redoLastAction(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(AUDIT_PREFIX + " Redo action requested. BoardId: {}, User: {}", boardId,
                                userEmail);

                BoardActionDTO.Response redoResult =
                                actionHistoryService.redoLastAction(boardId, userEmail);
                // Return the redone action details if available, otherwise indicate no content to
                // redo
                if (redoResult != null) {
                        log.info(ACTION_REDO, boardId, userEmail, redoResult.getType());
                        return ResponseEntity.ok(redoResult);
                } else {
                        log.debug(AUDIT_PREFIX + " No action to redo. BoardId: {}, User: {}",
                                        boardId, userEmail);
                        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
                }
        }

        /**
         * Updates the display name of a collaborative board. Only board members with appropriate
         * permissions can modify board names.
         * 
         * @param boardId the unique identifier of the board to update
         * @param request the new board name details
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing updated board information
         */
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

        /**
         * Updates the description text of a collaborative board. Provides additional context and
         * information about the board's purpose.
         * 
         * @param boardId the unique identifier of the board to update
         * @param request the new board description details
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing updated board information
         */
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

        /**
         * Uploads and sets a new picture/image for the board. Handles file upload validation and
         * stores the image for board display.
         * 
         * @param boardId the unique identifier of the board to update
         * @param file the image file to upload as board picture
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing updated board information with new picture
         */
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

        /**
         * Removes the current picture/image from a board. Deletes the board's associated image file
         * and updates board metadata.
         * 
         * @param boardId the unique identifier of the board to remove picture from
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing updated board information without picture
         */
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

        /**
         * Retrieves all chat messages associated with a specific board. Returns message history for
         * real-time collaboration communication.
         * 
         * @param boardId the unique identifier of the board whose messages to retrieve
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing list of chat messages for the board
         */
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

        /**
         * Updates canvas display and behavior settings for a board. Modifies canvas dimensions,
         * background color, and other visual properties.
         * 
         * @param boardId the unique identifier of the board to update
         * @param request the new canvas settings including dimensions and styling
         * @param authentication the authentication context containing user credentials
         * @return ResponseEntity containing updated board information with new canvas settings
         */
        @PutMapping(API_BOARDS_CANVAS_SETTINGS)
        public ResponseEntity<BoardDTO> updateCanvasSettings(
                        @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
                        @Valid @RequestBody UpdateCanvasSettingsRequest request,
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.info(AUDIT_PREFIX + " Canvas settings update. BoardId: {}, User: {}", boardId,
                                userEmail);

                BoardDTO updatedBoard =
                                boardService.updateCanvasSettings(boardId, request, userEmail);
                log.info(BOARD_UPDATED, boardId, "canvas settings", userEmail);
                return ResponseEntity.ok(updatedBoard);
        }
}
