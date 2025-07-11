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

import static com.synchboard.backend.config.ApplicationConstants.USER_NOT_FOUND;;

/**
 * Service class for managing group boards.
 * Handles creation of boards and retrieval of boards for a user.
 */
@Service
@RequiredArgsConstructor
public class GroupBoardService {

        private final GroupMemberRepository groupMemberRepository;
        private final GroupBoardRepository groupBoardRepository;
        private final UserRepository userRepository;

        /**
         * Retrieves a list of all boards that a user is a member of.
         *
         * @param userEmail the email of the user.
         * @return a list of BoardDTOs representing the user's boards.
         */
        @Transactional(readOnly = true)
        public List<BoardDTO> getBoardsForUser(String userEmail) {
                List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
                return memberships.stream()
                                .map(this::mapToBoardResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Creates a new board and assigns the creating user as the first admin member.
         *
         * @param request    the request DTO containing the new board's details.
         * @param ownerEmail the email of the user creating the board.
         * @return a BoardDTO representing the newly created board.
         */
        @Transactional
        public BoardDTO createBoard(CreateBoardRequest request, String ownerEmail) {
                User owner = userRepository.findById(ownerEmail)
                                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + ownerEmail));

                // Create and save the new GroupBoard entity.
                GroupBoard newBoard = GroupBoard.builder()
                                .boardGroupName(request.getName())
                                .groupDescription(request.getDescription())
                                .createdByUser(owner)
                                .build();
                groupBoardRepository.save(newBoard);

                // Create the initial membership for the owner, making them an admin.
                GroupMember newMembership = GroupMember.builder()
                                .user(owner)
                                .groupBoard(newBoard)
                                .userEmail(owner.getEmail())
                                .boardGroupId(newBoard.getBoardGroupId())
                                .isAdmin(true)
                                .build();
                groupMemberRepository.save(newMembership);

                return mapToBoardResponse(newMembership);
        }

        /**
         * Maps a GroupMember entity to a BoardDTO.
         * This helper method simplifies the conversion of board data for client
         * responses.
         *
         * @param membership the GroupMember entity to map from.
         * @return the resulting BoardDTO.
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