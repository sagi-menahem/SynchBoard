// File: backend/src/main/java/io/github/sagimenahem/synchboard/controller/GroupBoardController.java
package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.config.constants.ApiConstants.*;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.dto.board.*;
import io.github.sagimenahem.synchboard.dto.websocket.BoardActionDTO;
import io.github.sagimenahem.synchboard.dto.websocket.ChatMessageDTO;
import io.github.sagimenahem.synchboard.service.ActionHistoryService;
import io.github.sagimenahem.synchboard.service.BoardObjectService;
import io.github.sagimenahem.synchboard.service.ChatService;
import io.github.sagimenahem.synchboard.service.GroupBoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(API_BOARDS_BASE_PATH)
@RequiredArgsConstructor
public class GroupBoardController {

    private final GroupBoardService groupBoardService;
    private final BoardObjectService boardObjectService;
    private final ActionHistoryService actionHistoryService;
    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<BoardDTO>> getBoardsForCurrentUser(Authentication authentication) {
        String userEmail = authentication.getName();
        List<BoardDTO> boards = groupBoardService.getBoardsForUser(userEmail);
        return ResponseEntity.ok(boards);
    }

    @GetMapping(API_BOARDS_DETAILS)
    public ResponseEntity<BoardDetailsDTO> getBoardDetails(
            @PathVariable(PATH_VAR_BOARD_ID) Long boardId, Authentication authentication) {

        String userEmail = authentication.getName();
        BoardDetailsDTO boardDetails = groupBoardService.getBoardDetails(boardId, userEmail);
        return ResponseEntity.ok(boardDetails);
    }

    @PostMapping
    public ResponseEntity<BoardDTO> createBoard(@Valid @RequestBody CreateBoardRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        BoardDTO newBoard = groupBoardService.createBoard(request, userEmail);
        return new ResponseEntity<>(newBoard, HttpStatus.CREATED);
    }

    @GetMapping(API_BOARDS_OBJECT)
    public ResponseEntity<List<BoardActionDTO.Response>> getBoardObjects(
            @PathVariable(PATH_VAR_BOARD_ID) Long boardId, Authentication authentication) {
        List<BoardActionDTO.Response> objects =
                boardObjectService.getObjectsForBoard(boardId, authentication.getName());
        return ResponseEntity.ok(objects);
    }

    @PostMapping(API_BOARDS_MEMBERS)
    public ResponseEntity<MemberDTO> inviteMember(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
            @Valid @RequestBody InviteRequest request, Authentication authentication) {

        String invitingUserEmail = authentication.getName();
        MemberDTO newMember =
                groupBoardService.inviteMember(boardId, request.getEmail(), invitingUserEmail);
        return new ResponseEntity<>(newMember, HttpStatus.CREATED);
    }

    @DeleteMapping(API_BOARDS_MEMBERS_REMOVE)
    public ResponseEntity<?> removeMember(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
            @PathVariable(PATH_VAR_MEMBER_EMAIL) String memberEmail,
            Authentication authentication) {

        String requestingUserEmail = authentication.getName();
        groupBoardService.removeMember(boardId, memberEmail, requestingUserEmail);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping(API_BOARDS_MEMBERS_LEAVE)
    public ResponseEntity<?> leaveBoard(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        groupBoardService.leaveBoard(boardId, userEmail);
        return ResponseEntity.ok().build();
    }

    @PutMapping(API_BOARDS_MEMBERS_PROMOTE)
    public ResponseEntity<MemberDTO> promoteMember(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
            @PathVariable(PATH_VAR_MEMBER_EMAIL) String memberEmail,
            Authentication authentication) {

        String requestingUserEmail = authentication.getName();
        MemberDTO updatedMember =
                groupBoardService.promoteMember(boardId, memberEmail, requestingUserEmail);
        return ResponseEntity.ok(updatedMember);
    }

    @PostMapping(API_BOARDS_UNDO)
    public ResponseEntity<?> undoLastAction(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        BoardActionDTO.Response undoResult =
                actionHistoryService.undoLastAction(boardId, userEmail);
        if (undoResult != null) {
            return ResponseEntity.ok(undoResult);
        } else {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
    }

    @PostMapping(API_BOARDS_REDO)
    public ResponseEntity<?> redoLastAction(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        BoardActionDTO.Response redoResult =
                actionHistoryService.redoLastAction(boardId, userEmail);
        if (redoResult != null) {
            return ResponseEntity.ok(redoResult);
        } else {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
    }

    @PutMapping(API_BOARDS_NAME)
    public ResponseEntity<BoardDTO> updateBoardName(@PathVariable(PATH_VAR_BOARD_ID) Long boardId,
            @Valid @RequestBody UpdateBoardNameRequest request, Authentication authentication) {

        String userEmail = authentication.getName();
        BoardDTO updatedBoard =
                groupBoardService.updateBoardName(boardId, request.getName(), userEmail);
        return ResponseEntity.ok(updatedBoard);
    }

    @PutMapping(API_BOARDS_DESCRIPTION)
    public ResponseEntity<BoardDTO> updateBoardDescription(
            @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
            @Valid @RequestBody UpdateBoardDescriptionRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        BoardDTO updatedBoard = groupBoardService.updateBoardDescription(boardId,
                request.getDescription(), userEmail);
        return ResponseEntity.ok(updatedBoard);
    }

    @PostMapping(API_BOARDS_PICTURE)
    public ResponseEntity<BoardDTO> uploadBoardPicture(
            @PathVariable(PATH_VAR_BOARD_ID) Long boardId,
            @RequestParam(REQUEST_PARAM_FILE) MultipartFile file, Authentication authentication) {

        String userEmail = authentication.getName();
        BoardDTO updatedBoard = groupBoardService.updateBoardPicture(boardId, file, userEmail);
        return ResponseEntity.ok(updatedBoard);
    }

    @DeleteMapping(API_BOARDS_PICTURE)
    public ResponseEntity<BoardDTO> deleteBoardPicture(
            @PathVariable(PATH_VAR_BOARD_ID) Long boardId, Authentication authentication) {

        String userEmail = authentication.getName();
        BoardDTO updatedBoard = groupBoardService.deleteBoardPicture(boardId, userEmail);
        return ResponseEntity.ok(updatedBoard);
    }

    @GetMapping(API_BOARDS_MESSAGES)
    public ResponseEntity<List<ChatMessageDTO.Response>> getBoardMessages(
            @PathVariable(PATH_VAR_BOARD_ID) Long boardId, Authentication authentication) {
        List<ChatMessageDTO.Response> messages =
                chatService.getMessagesForBoard(boardId, authentication.getName());
        return ResponseEntity.ok(messages);
    }
}
