// File: backend/src/main/java/com/synchboard/backend/service/GroupBoardService.java
package com.synchboard.backend.service;

import com.synchboard.backend.dto.board.BoardDTO;
import com.synchboard.backend.dto.board.CreateBoardRequest;
import com.synchboard.backend.dto.board.MemberDTO;
import com.synchboard.backend.entity.GroupBoard;
import com.synchboard.backend.entity.GroupMember;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.repository.GroupBoardRepository;
import com.synchboard.backend.repository.GroupMemberRepository;
import com.synchboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

import static com.synchboard.backend.config.ApplicationConstants.*;

@Service
@RequiredArgsConstructor
public class GroupBoardService {

        private final GroupMemberRepository groupMemberRepository;
        private final GroupBoardRepository groupBoardRepository;
        private final UserRepository userRepository;

        @Transactional(readOnly = true)
        public List<BoardDTO> getBoardsForUser(String userEmail) {
                List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
                return memberships.stream()
                                .map(this::mapToBoardResponse)
                                .collect(Collectors.toList());
        }

        @Transactional
        public BoardDTO createBoard(CreateBoardRequest request, String ownerEmail) {
                User owner = userRepository.findById(ownerEmail)
                                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + ownerEmail));

                GroupBoard newBoard = GroupBoard.builder()
                                .boardGroupName(request.getName())
                                .groupDescription(request.getDescription())
                                .createdByUser(owner)
                                .build();
                groupBoardRepository.save(newBoard);

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

        @Transactional
        public MemberDTO inviteMember(Long boardId, String invitedUserEmail, String invitingUserEmail) {
                GroupMember invitingMember = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, invitingUserEmail)
                                .orElseThrow(() -> new AccessDeniedException(ERROR_ACCESS_DENIED_NOT_A_MEMBER));

                if (!invitingMember.getIsAdmin()) {
                        throw new AccessDeniedException(ERROR_ACCESS_DENIED_NOT_AN_ADMIN);
                }

                User userToInvite = userRepository.findById(invitedUserEmail)
                                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + invitedUserEmail));

                if (groupMemberRepository.existsByUserEmailAndBoardGroupId(invitedUserEmail, boardId)) {
                        throw new IllegalArgumentException(ERROR_USER_ALREADY_MEMBER);
                }

                GroupBoard board = invitingMember.getGroupBoard();
                GroupMember newMembership = GroupMember.builder()
                                .user(userToInvite)
                                .groupBoard(board)
                                .userEmail(userToInvite.getEmail())
                                .boardGroupId(board.getBoardGroupId())
                                .isAdmin(false)
                                .build();

                groupMemberRepository.save(newMembership);

                return mapToMemberDTO(newMembership);
        }

        private MemberDTO mapToMemberDTO(GroupMember membership) {
                return MemberDTO.builder()
                                .email(membership.getUser().getEmail())
                                .firstName(membership.getUser().getFirstName())
                                .lastName(membership.getUser().getLastName())
                                .profilePictureUrl(membership.getUser().getProfilePictureUrl())
                                .isAdmin(membership.getIsAdmin())
                                .build();
        }
}