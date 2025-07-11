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

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * REST controller for managing group boards.
 * Handles HTTP requests related to creating boards, fetching user-specific
 * boards,
 * and retrieving objects on a particular board.
 */
@RestController
@RequestMapping(API_BOARDS_PATH)
@RequiredArgsConstructor
public class GroupBoardController {

    private final GroupBoardService groupBoardService;
    private final BoardObjectService boardObjectService;

    /**
     * Fetches all boards associated with the currently authenticated user.
     *
     * @param authentication The authentication object containing the principal's
     *                       details.
     * @return A ResponseEntity containing a list of {@link BoardDTO} objects.
     */
    @GetMapping
    public ResponseEntity<List<BoardDTO>> getBoardsForCurrentUser(Authentication authentication) {
        // The 'name' of the authentication principal is the user's email in this
        // application.
        String userEmail = authentication.getName();
        List<BoardDTO> boards = groupBoardService.getBoardsForUser(userEmail);
        return ResponseEntity.ok(boards);
    }

    /**
     * Creates a new board for the currently authenticated user.
     *
     * @param request        The request body containing details for the new board.
     *                       It is validated before processing.
     * @param authentication The authentication object to identify the board owner.
     * @return A ResponseEntity containing the newly created {@link BoardDTO} with
     *         an HTTP status of CREATED.
     */
    @PostMapping
    public ResponseEntity<BoardDTO> createBoard(@Valid @RequestBody CreateBoardRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        BoardDTO newBoard = groupBoardService.createBoard(request, userEmail);
        return new ResponseEntity<>(newBoard, HttpStatus.CREATED);
    }

    /**
     * Retrieves all objects (e.g., drawings, text) for a specific board.
     * This is used to load the initial state of a board when a user joins.
     *
     * @param boardId The ID of the board for which to fetch objects.
     * @return A ResponseEntity containing a list of {@link BoardActionDTO.Response}
     *         objects.
     */
    @GetMapping(API_BOARDS_OBJECT)
    public ResponseEntity<List<BoardActionDTO.Response>> getBoardObjects(@PathVariable("boardId") Long boardId) {
        List<BoardActionDTO.Response> objects = boardObjectService.getObjectsForBoard(boardId);
        return ResponseEntity.ok(objects);
    }
}