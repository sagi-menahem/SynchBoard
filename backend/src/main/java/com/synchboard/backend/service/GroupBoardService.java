// File: backend/src/main/java/com/synchboard/backend/service/GroupBoardService.java

package com.synchboard.backend.service;

import com.synchboard.backend.dto.board.BoardDTO;
import com.synchboard.backend.dto.board.CreateBoardRequest;
import com.synchboard.backend.entity.GroupBoard;
import com.synchboard.backend.entity.GroupMember;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.repository.GroupBoardRepository;
import com.synchboard.backend.repository.GroupMemberRepository;
import com.synchboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
        private final GroupBoardRepository groupBoardRepository; // Add this
        private final UserRepository userRepository; // Add this

        /**
         * Retrieves all boards a user is a member of.
         */
        @Transactional(readOnly = true)
        public List<BoardDTO> getBoardsForUser(String userEmail) {
                List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
                return memberships.stream()
                                .map(this::mapToBoardResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Creates a new board and sets the creator as the first admin member.
         * This operation is transactional.
         *
         * @param request    The DTO containing the new board's details.
         * @param ownerEmail The email of the user creating the board.
         * @return A DTO representing the newly created board.
         */
        @Transactional
        public BoardDTO createBoard(CreateBoardRequest request, String ownerEmail) {
                // 1. Find the user who is creating the board
                User owner = userRepository.findById(ownerEmail)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + ownerEmail));

                // 2. Create and save the new GroupBoard entity
                GroupBoard newBoard = GroupBoard.builder()
                                .boardGroupName(request.getName())
                                .groupDescription(request.getDescription())
                                .createdByUser(owner)
                                .build();
                groupBoardRepository.save(newBoard);

                // 3. Create and save the membership link, making the owner an admin
                GroupMember newMembership = GroupMember.builder()
                                .user(owner)
                                .groupBoard(newBoard)
                                .userEmail(owner.getEmail())
                                .boardGroupId(newBoard.getBoardGroupId())
                                .isAdmin(true)
                                .build();
                groupMemberRepository.save(newMembership);

                // 4. Return the DTO for the new board
                return mapToBoardResponse(newMembership);
        }

        /**
         * Helper method to convert a GroupMember entity to a BoardResponse DTO.
         */
        private BoardDTO mapToBoardResponse(GroupMember membership) {
                return BoardDTO.builder()
                                .id(membership.getGroupBoard().getBoardGroupId())
                                .name(membership.getGroupBoard().getBoardGroupName())
                                .description(membership.getGroupBoard().getGroupDescription())
                                .pictureUrl(membership.getGroupBoard().getGroupPictureUrl())
                                .lastModifiedDate(membership.getGroupBoard().getLastModifiedDate())
                                .isAdmin(membership.getIsAdmin())
                                .build();
        }
}