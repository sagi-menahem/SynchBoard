package io.github.sagimenahem.synchboard.service.board;

import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.GroupBoardRepository;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

/**
 * Service for validating and managing board access permissions. Provides methods to check if users
 * have appropriate access levels (member, admin, creator) for performing operations on boards.
 *
 * @author Sagi Menahem
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BoardAccessService {

    /** Repository for accessing board data */
    private final GroupBoardRepository boardRepository;
    /** Repository for managing board memberships */
    private final GroupMemberRepository memberRepository;
    /** Repository for user data validation */
    private final UserRepository userRepository;

    /**
     * Validates that a user has access to a specific board. Checks if the user is either the board
     * creator or a member of the board.
     *
     * @param boardId The ID of the board to validate access for
     * @param userEmail The email of the user requesting access
     * @return The GroupBoard entity if access is granted
     * @throws ResourceNotFoundException if the board or user is not found
     * @throws AccessDeniedException if the user is not a member of the board
     */
    public GroupBoard validateBoardAccess(Long boardId, String userEmail) {
        GroupBoard board = boardRepository
            .findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        userRepository.findById(userEmail).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (board.getCreatedByUser() != null && board.getCreatedByUser().getEmail().equals(userEmail)) {
            return board;
        }

        boolean isMember = memberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId);
        if (!isMember) {
            throw new AccessDeniedException("User is not a member of this board");
        }

        return board;
    }

    /**
     * Validates that a user has administrative access to a specific board. Checks if the user is
     * either the board creator or an admin member.
     *
     * @param boardId The ID of the board to validate admin access for
     * @param userEmail The email of the user requesting admin access
     * @return The GroupBoard entity if admin access is granted
     * @throws ResourceNotFoundException if the board is not found
     * @throws AccessDeniedException if the user does not have admin privileges
     */
    public GroupBoard validateAdminAccess(Long boardId, String userEmail) {
        GroupBoard board = validateBoardAccess(boardId, userEmail);

        if (board.getCreatedByUser() != null && board.getCreatedByUser().getEmail().equals(userEmail)) {
            return board;
        }

        GroupMember membership = memberRepository
            .findByBoardGroupIdAndUserEmail(boardId, userEmail)
            .orElseThrow(() -> new AccessDeniedException("User is not a member of this board"));

        if (!membership.getIsAdmin()) {
            throw new AccessDeniedException("User does not have admin privileges for this board");
        }

        return board;
    }

    /**
     * Validates that a user is the creator of a specific board. Only the original creator can
     * perform certain operations like deleting the board.
     *
     * @param boardId The ID of the board to validate creator access for
     * @param userEmail The email of the user claiming to be the creator
     * @return The GroupBoard entity if creator access is granted
     * @throws ResourceNotFoundException if the board is not found
     * @throws AccessDeniedException if the user is not the board creator
     */
    public GroupBoard validateCreatorAccess(Long boardId, String userEmail) {
        GroupBoard board = boardRepository
            .findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        if (board.getCreatedByUser() == null || !board.getCreatedByUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("Only the board creator can perform this operation");
        }

        return board;
    }

    /**
     * Checks if a user is a member of a specific board without throwing exceptions.
     *
     * @param boardId The ID of the board to check membership for
     * @param userEmail The email of the user to check
     * @return true if the user is a member of the board, false otherwise
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
     * Checks if a user has administrative privileges on a specific board without throwing
     * exceptions.
     *
     * @param boardId The ID of the board to check admin access for
     * @param userEmail The email of the user to check
     * @return true if the user has admin access to the board, false otherwise
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
     * Checks if a user is the creator of a specific board without throwing exceptions.
     *
     * @param boardId The ID of the board to check creator status for
     * @param userEmail The email of the user to check
     * @return true if the user is the board creator, false otherwise
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
