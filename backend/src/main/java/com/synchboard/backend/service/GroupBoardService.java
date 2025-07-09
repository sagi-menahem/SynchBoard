// File: backend/src/main/java/com/synchboard/backend/service/GroupBoardService.java

package com.synchboard.backend.service;

import com.synchboard.backend.dto.board.BoardResponse;
import com.synchboard.backend.entity.GroupMember;
import com.synchboard.backend.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for board-related business logic.
 */
@Service
@RequiredArgsConstructor
public class GroupBoardService {

    private final GroupMemberRepository groupMemberRepository;

    /**
     * Retrieves all boards a user is a member of.
     *
     * @param userEmail The email of the user whose boards are to be fetched.
     * @return A list of BoardResponse DTOs representing the boards.
     */
    @Transactional(readOnly = true)
    public List<BoardResponse> getBoardsForUser(String userEmail) {
        // 1. Fetch all membership records for the given user email
        List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);

        // 2. Map the list of GroupMember entities to a list of BoardResponse DTOs
        return memberships.stream()
                .map(this::mapToBoardResponse)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to convert a GroupMember entity to a BoardResponse DTO.
     *
     * @param membership The GroupMember entity to convert.
     * @return A BoardResponse DTO.
     */
    private BoardResponse mapToBoardResponse(GroupMember membership) {
        return BoardResponse.builder()
                .id(membership.getGroupBoard().getBoardGroupId())
                .name(membership.getGroupBoard().getBoardGroupName())
                .description(membership.getGroupBoard().getGroupDescription())
                .pictureUrl(membership.getGroupBoard().getGroupPictureUrl())
                .lastModifiedDate(membership.getGroupBoard().getLastModifiedDate())
                .isAdmin(membership.getIsAdmin())
                .build();
    }
}