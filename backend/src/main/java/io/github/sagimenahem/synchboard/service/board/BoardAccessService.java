package io.github.sagimenahem.synchboard.service.board;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.GroupBoardRepository;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardAccessService {

    private final GroupBoardRepository boardRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;

    public GroupBoard validateBoardAccess(Long boardId, String userEmail) {
        GroupBoard board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        userRepository.findById(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (board.getCreatedByUser() != null
                && board.getCreatedByUser().getEmail().equals(userEmail)) {
            return board;
        }

        boolean isMember = memberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId);
        if (!isMember) {
            throw new AccessDeniedException("User is not a member of this board");
        }

        return board;
    }

    public GroupBoard validateAdminAccess(Long boardId, String userEmail) {
        GroupBoard board = validateBoardAccess(boardId, userEmail);

        if (board.getCreatedByUser() != null
                && board.getCreatedByUser().getEmail().equals(userEmail)) {
            return board;
        }

        GroupMember membership = memberRepository.findByBoardGroupIdAndUserEmail(boardId, userEmail)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this board"));

        if (!membership.getIsAdmin()) {
            throw new AccessDeniedException("User does not have admin privileges for this board");
        }

        return board;
    }

    public GroupBoard validateCreatorAccess(Long boardId, String userEmail) {
        GroupBoard board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        if (board.getCreatedByUser() == null
                || !board.getCreatedByUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("Only the board creator can perform this operation");
        }

        return board;
    }

    public boolean isBoardMember(Long boardId, String userEmail) {
        try {
            validateBoardAccess(boardId, userEmail);
            return true;
        } catch (AccessDeniedException | ResourceNotFoundException e) {
            log.debug("User {} is not a member of board {}: {}", userEmail, boardId,
                    e.getMessage());
            return false;
        }
    }

    public boolean isBoardAdmin(Long boardId, String userEmail) {
        try {
            validateAdminAccess(boardId, userEmail);
            return true;
        } catch (AccessDeniedException | ResourceNotFoundException e) {
            log.debug("User {} does not have admin access to board {}: {}", userEmail, boardId,
                    e.getMessage());
            return false;
        }
    }

    public boolean isBoardCreator(Long boardId, String userEmail) {
        try {
            validateCreatorAccess(boardId, userEmail);
            return true;
        } catch (AccessDeniedException | ResourceNotFoundException e) {
            log.debug("User {} is not the creator of board {}: {}", userEmail, boardId,
                    e.getMessage());
            return false;
        }
    }
}
