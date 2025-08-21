package io.github.sagimenahem.synchboard.service.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MembershipService {

    private final GroupMemberRepository groupMemberRepository;

    /**
     * Validates that a user has access to a specific board
     * @param userEmail the email of the user to check
     * @param boardId the ID of the board to check access for
     * @throws AccessDeniedException if the user is not a member of the board
     */
    public void validateBoardAccess(String userEmail, Long boardId) {
        if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }
    }

    /**
     * Checks if a user has access to a specific board without throwing an exception
     * @param userEmail the email of the user to check
     * @param boardId the ID of the board to check access for
     * @return true if the user has access, false otherwise
     */
    public boolean hasBoardAccess(String userEmail, Long boardId) {
        return groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId);
    }
}