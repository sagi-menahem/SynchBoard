// File: backend/src/main/java/com/synchboard/backend/controller/GroupBoardController.java

package com.synchboard.backend.controller;

import com.synchboard.backend.dto.board.BoardResponse;
import com.synchboard.backend.dto.board.CreateBoardRequest;
import com.synchboard.backend.service.GroupBoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for board-related operations.
 */
@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class GroupBoardController {

    private final GroupBoardService groupBoardService;

    /**
     * GET /api/boards : Fetches the list of boards for the currently authenticated
     * user.
     */
    @GetMapping
    public ResponseEntity<List<BoardResponse>> getBoardsForCurrentUser(Authentication authentication) {
        String userEmail = authentication.getName();
        List<BoardResponse> boards = groupBoardService.getBoardsForUser(userEmail);
        return ResponseEntity.ok(boards);
    }

    /**
     * POST /api/boards : Creates a new board for the currently authenticated user.
     *
     * @param request        The request body containing the new board's details.
     * @param authentication The authentication object injected by Spring Security.
     * @return A ResponseEntity containing the newly created board's DTO and a 201
     *         Created status.
     */
    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(
            @Valid @RequestBody CreateBoardRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        BoardResponse newBoard = groupBoardService.createBoard(request, userEmail);
        return new ResponseEntity<>(newBoard, HttpStatus.CREATED);
    }
}