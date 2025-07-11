// File: backend/src/main/java/com/synchboard/backend/controller/GroupBoardController.java

package com.synchboard.backend.controller;

import com.synchboard.backend.dto.board.BoardDTO;
import com.synchboard.backend.dto.board.CreateBoardRequest;
import com.synchboard.backend.dto.websocket.BoardActionDTO;
import com.synchboard.backend.service.BoardObjectService;
import com.synchboard.backend.service.GroupBoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class GroupBoardController {

    private final GroupBoardService groupBoardService;
    private final BoardObjectService boardObjectService;

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

    /**
     * GET /api/boards/{boardId}/objects : Fetches all saved objects for a specific
     * board.
     * 
     * @param boardId The ID of the board, extracted from the URL path.
     * @return A list of board action DTOs.
     */
    @GetMapping("/{boardId}/objects")
    // THE ONLY CHANGE IS HERE: We explicitly name the PathVariable
    public ResponseEntity<List<BoardActionDTO.Response>> getBoardObjects(@PathVariable("boardId") Long boardId) {
        List<BoardActionDTO.Response> objects = boardObjectService.getObjectsForBoard(boardId);
        return ResponseEntity.ok(objects);
    }
}