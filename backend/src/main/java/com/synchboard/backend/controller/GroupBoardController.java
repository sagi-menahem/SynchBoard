// File: backend/src/main/java/com/synchboard/backend/controller/GroupBoardController.java
package com.synchboard.backend.controller;

import com.synchboard.backend.dto.board.BoardDTO;
import com.synchboard.backend.dto.board.CreateBoardRequest;
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

import java.util.List;

import static com.synchboard.backend.config.ApplicationConstants.*;

@RestController
@RequestMapping(API_BOARDS_PATH)
@RequiredArgsConstructor
public class GroupBoardController {

    private final GroupBoardService groupBoardService;
    private final BoardObjectService boardObjectService;
    private final ActionHistoryService actionHistoryService;

    @GetMapping
    public ResponseEntity<List<BoardDTO>> getBoardsForCurrentUser(Authentication authentication) {
        String userEmail = authentication.getName();
        List<BoardDTO> boards = groupBoardService.getBoardsForUser(userEmail);
        return ResponseEntity.ok(boards);
    }

    @PostMapping
    public ResponseEntity<BoardDTO> createBoard(@Valid @RequestBody CreateBoardRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        BoardDTO newBoard = groupBoardService.createBoard(request, userEmail);
        return new ResponseEntity<>(newBoard, HttpStatus.CREATED);
    }

    @GetMapping(API_BOARDS_OBJECT)
    public ResponseEntity<List<BoardActionDTO.Response>> getBoardObjects(@PathVariable("boardId") Long boardId) {
        List<BoardActionDTO.Response> objects = boardObjectService.getObjectsForBoard(boardId);
        return ResponseEntity.ok(objects);
    }

    @PostMapping("/{boardId}/undo")
    public ResponseEntity<?> undoLastAction(@PathVariable("boardId") Long boardId, Authentication authentication) {
        // Extract user's email from the security context
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
}