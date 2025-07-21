// File: backend/src/main/java/com/synchboard/backend/controller/GroupBoardController.java
package com.synchboard.backend.controller;

import com.synchboard.backend.dto.board.BoardDTO;
import com.synchboard.backend.dto.board.BoardDetailsDTO;
import com.synchboard.backend.dto.board.CreateBoardRequest;
import com.synchboard.backend.dto.board.InviteRequest;
import com.synchboard.backend.dto.board.MemberDTO;
import com.synchboard.backend.dto.board.UpdateBoardDescriptionRequest;
import com.synchboard.backend.dto.board.UpdateBoardNameRequest;
import com.synchboard.backend.dto.websocket.BoardActionDTO;
import com.synchboard.backend.service.ActionHistoryService;
import com.synchboard.backend.service.BoardObjectService;
import com.synchboard.backend.service.GroupBoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.synchboard.backend.dto.websocket.ChatMessageDTO;
import com.synchboard.backend.service.ChatService;

import java.util.List;

import static com.synchboard.backend.config.ApplicationConstants.*;

//TODO use service
@RestController
@RequestMapping(API_BOARDS_PATH)
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

    @GetMapping("/{boardId}/details")
    public ResponseEntity<BoardDetailsDTO> getBoardDetails(
            @PathVariable("boardId") Long boardId,
            Authentication authentication) {

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

    // TODO move to board activity
    @GetMapping(API_BOARDS_OBJECT)
    public ResponseEntity<List<BoardActionDTO.Response>> getBoardObjects(
            @PathVariable("boardId") Long boardId, Authentication authentication) {
        List<BoardActionDTO.Response> objects = boardObjectService.getObjectsForBoard(boardId,
                authentication.getName());
        return ResponseEntity.ok(objects);
    }

    @PostMapping("/{boardId}/members")
    public ResponseEntity<MemberDTO> inviteMember(
            @PathVariable("boardId") Long boardId,
            @Valid @RequestBody InviteRequest request,
            Authentication authentication) {

        String invitingUserEmail = authentication.getName();
        MemberDTO newMember = groupBoardService.inviteMember(boardId, request.getEmail(), invitingUserEmail);
        return new ResponseEntity<>(newMember, HttpStatus.CREATED);
    }

    @DeleteMapping("/{boardId}/members/{memberEmail}")
    public ResponseEntity<?> removeMember(
            @PathVariable("boardId") Long boardId,
            @PathVariable("memberEmail") String memberEmail,
            Authentication authentication) {

        String requestingUserEmail = authentication.getName();
        groupBoardService.removeMember(boardId, memberEmail, requestingUserEmail);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{boardId}/members/leave")
    public ResponseEntity<?> leaveBoard(
            @PathVariable("boardId") Long boardId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        groupBoardService.leaveBoard(boardId, userEmail);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{boardId}/members/{memberEmail}/promote")
    public ResponseEntity<MemberDTO> promoteMember(
            @PathVariable("boardId") Long boardId,
            @PathVariable("memberEmail") String memberEmail,
            Authentication authentication) {

        String requestingUserEmail = authentication.getName();
        MemberDTO updatedMember = groupBoardService.promoteMember(boardId, memberEmail, requestingUserEmail);
        return ResponseEntity.ok(updatedMember);
    }

    @PostMapping("/{boardId}/undo")
    public ResponseEntity<?> undoLastAction(@PathVariable("boardId") Long boardId, Authentication authentication) {
        String userEmail = authentication.getName();
        BoardActionDTO.Response undoResult = actionHistoryService.undoLastAction(boardId, userEmail);
        if (undoResult != null) {
            return ResponseEntity.ok(undoResult);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No actions available to undo.");
        }
    }

    @PostMapping("/{boardId}/redo")
    public ResponseEntity<?> redoLastAction(@PathVariable("boardId") Long boardId, Authentication authentication) {
        String userEmail = authentication.getName();
        BoardActionDTO.Response redoResult = actionHistoryService.redoLastAction(boardId, userEmail);
        if (redoResult != null) {
            return ResponseEntity.ok(redoResult);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No actions available to redo.");
        }
    }

    @PutMapping("/{boardId}/name")
    public ResponseEntity<BoardDTO> updateBoardName(
            @PathVariable("boardId") Long boardId,
            @Valid @RequestBody UpdateBoardNameRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        BoardDTO updatedBoard = groupBoardService.updateBoardName(boardId, request.getName(), userEmail);
        return ResponseEntity.ok(updatedBoard);
    }

    @PutMapping("/{boardId}/description")
    public ResponseEntity<BoardDTO> updateBoardDescription(
            @PathVariable("boardId") Long boardId,
            @Valid @RequestBody UpdateBoardDescriptionRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        BoardDTO updatedBoard = groupBoardService.updateBoardDescription(boardId, request.getDescription(), userEmail);
        return ResponseEntity.ok(updatedBoard);
    }

    @PostMapping("/{boardId}/picture")
    public ResponseEntity<BoardDTO> uploadBoardPicture(
            @PathVariable("boardId") Long boardId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String userEmail = authentication.getName();
        BoardDTO updatedBoard = groupBoardService.updateBoardPicture(boardId, file, userEmail);
        return ResponseEntity.ok(updatedBoard);
    }

    @DeleteMapping("/{boardId}/picture")
    public ResponseEntity<BoardDTO> deleteBoardPicture(
            @PathVariable("boardId") Long boardId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        BoardDTO updatedBoard = groupBoardService.deleteBoardPicture(boardId, userEmail);
        return ResponseEntity.ok(updatedBoard);
    }

    @GetMapping("/{boardId}/messages")
    public ResponseEntity<List<ChatMessageDTO.Response>> getBoardMessages(
            @PathVariable("boardId") Long boardId, Authentication authentication) {
        List<ChatMessageDTO.Response> messages = chatService.getMessagesForBoard(boardId, authentication.getName());
        return ResponseEntity.ok(messages);
    }
}