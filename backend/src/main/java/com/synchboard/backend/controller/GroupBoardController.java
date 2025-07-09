// File: backend/src/main/java/com/synchboard/backend/controller/GroupBoardController.java

package com.synchboard.backend.controller;

import com.synchboard.backend.dto.board.BoardResponse;
import com.synchboard.backend.service.GroupBoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
     *
     * @param authentication The authentication object injected by Spring Security.
     * @return A ResponseEntity containing a list of BoardResponse DTOs and a 200 OK
     *         status.
     */
    @GetMapping
    public ResponseEntity<List<BoardResponse>> getBoardsForCurrentUser(Authentication authentication) {
        // Spring Security provides the 'authentication' object, which holds the user's
        // details.
        // The user's name, in our case, is their email address.
        String userEmail = authentication.getName();

        List<BoardResponse> boards = groupBoardService.getBoardsForUser(userEmail);
        return ResponseEntity.ok(boards);
    }
}