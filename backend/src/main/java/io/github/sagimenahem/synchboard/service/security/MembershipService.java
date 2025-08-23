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

    public void validateBoardAccess(String userEmail, Long boardId) {
        if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }
    }

    public boolean hasBoardAccess(String userEmail, Long boardId) {
        return groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId);
    }
}