package io.github.sagimenahem.synchboard.service.board;

import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.GroupBoardRepository;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardAccessService {

    private final GroupBoardRepository boardRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;

    /**
     * Validates that a user has access to a board
     * @param boardId The board ID to check
     * @param userEmail The user email to validate
     * @return The board if access is granted
     * @throws ResourceNotFoundException if board or user not found
     * @throws AccessDeniedException if user doesn't have access
     */
    public GroupBoard validateBoardAccess(Long boardId, String userEmail) {
        GroupBoard board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        // Validate user exists
        userRepository.findById(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if user is the creator
        if (board.getCreatedByUser() != null && 
            board.getCreatedByUser().getEmail().equals(userEmail)) {
            return board;
        }

        // Check membership
        boolean isMember = memberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId);
        if (!isMember) {
            throw new AccessDeniedException("User is not a member of this board");
        }

        return board;
    }

    /**
     * Validates that a user has admin access to a board
     * @param boardId The board ID to check
     * @param userEmail The user email to validate
     * @return The board if admin access is granted
     * @throws ResourceNotFoundException if board or user not found
     * @throws AccessDeniedException if user doesn't have admin access
     */
    public GroupBoard validateAdminAccess(Long boardId, String userEmail) {
        GroupBoard board = validateBoardAccess(boardId, userEmail);
        
        // Check if user is the creator (always has admin access)
        if (board.getCreatedByUser() != null && 
            board.getCreatedByUser().getEmail().equals(userEmail)) {
            return board;
        }

        // Check if user is admin
        GroupMember membership = memberRepository.findByBoardGroupIdAndUserEmail(boardId, userEmail)
            .orElseThrow(() -> new AccessDeniedException("User is not a member of this board"));
        
        if (!membership.getIsAdmin()) {
            throw new AccessDeniedException("User does not have admin privileges for this board");
        }

        return board;
    }

    /**
     * Validates that a user is the creator/owner of a board
     * @param boardId The board ID to check
     * @param userEmail The user email to validate
     * @return The board if user is the creator
     * @throws ResourceNotFoundException if board not found
     * @throws AccessDeniedException if user is not the creator
     */
    public GroupBoard validateCreatorAccess(Long boardId, String userEmail) {
        GroupBoard board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        if (board.getCreatedByUser() == null || 
            !board.getCreatedByUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("Only the board creator can perform this operation");
        }

        return board;
    }

    /**
     * Checks if a user is a member of a board
     * @param boardId The board ID
     * @param userEmail The user email
     * @return true if the user is a member or creator, false otherwise
     */
    public boolean isBoardMember(Long boardId, String userEmail) {
        try {
            validateBoardAccess(boardId, userEmail);
            return true;
        } catch (AccessDeniedException | ResourceNotFoundException e) {
            log.debug("User {} is not a member of board {}: {}", userEmail, boardId, e.getMessage());
            return false;
        }
    }

    /**
     * Checks if a user has admin access to a board
     * @param boardId The board ID
     * @param userEmail The user email
     * @return true if the user is an admin or creator, false otherwise
     */
    public boolean isBoardAdmin(Long boardId, String userEmail) {
        try {
            validateAdminAccess(boardId, userEmail);
            return true;
        } catch (AccessDeniedException | ResourceNotFoundException e) {
            log.debug("User {} does not have admin access to board {}: {}", userEmail, boardId, e.getMessage());
            return false;
        }
    }

    /**
     * Checks if a user is the creator of a board
     * @param boardId The board ID
     * @param userEmail The user email
     * @return true if the user is the creator, false otherwise
     */
    public boolean isBoardCreator(Long boardId, String userEmail) {
        try {
            validateCreatorAccess(boardId, userEmail);
            return true;
        } catch (AccessDeniedException | ResourceNotFoundException e) {
            log.debug("User {} is not the creator of board {}: {}", userEmail, boardId, e.getMessage());
            return false;
        }
    }
}