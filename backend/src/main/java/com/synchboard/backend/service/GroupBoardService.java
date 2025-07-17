// File: backend/src/main/java/com/synchboard/backend/service/GroupBoardService.java
package com.synchboard.backend.service;

import com.synchboard.backend.dto.board.BoardDTO;
import com.synchboard.backend.dto.board.BoardDetailsDTO;
import com.synchboard.backend.dto.board.CreateBoardRequest;
import com.synchboard.backend.dto.board.MemberDTO;
import com.synchboard.backend.entity.GroupBoard;
import com.synchboard.backend.entity.GroupMember;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.exception.ResourceNotFoundException;
import com.synchboard.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;

import static com.synchboard.backend.config.ApplicationConstants.*;

@Service
@RequiredArgsConstructor
public class GroupBoardService {

        private static final Logger log = LoggerFactory.getLogger(GroupBoardService.class);

        private final GroupMemberRepository groupMemberRepository;
        private final GroupBoardRepository groupBoardRepository;
        private final UserRepository userRepository;
        private final ActionHistoryRepository actionHistoryRepository;
        private final BoardObjectRepository boardObjectRepository;
        private final FileStorageService fileStorageService;

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

        @Transactional
        public MemberDTO inviteMember(Long boardId, String invitedUserEmail, String invitingUserEmail) {
                GroupMember invitingMember = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, invitingUserEmail)
                                .orElseThrow(() -> new AccessDeniedException(ERROR_ACCESS_DENIED_NOT_A_MEMBER));

                log.info("Checking admin status for user: {}. Is admin? {}", invitingMember.getUserEmail(),
                                invitingMember.getIsAdmin());

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

        @Transactional(readOnly = true)
        public BoardDetailsDTO getBoardDetails(Long boardId, String userEmail) {
                if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
                        throw new AccessDeniedException(ERROR_ACCESS_DENIED_NOT_A_MEMBER_OF_BOARD);
                }

                GroupBoard board = groupBoardRepository.findById(boardId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Board not found with id: " + boardId));

                List<GroupMember> members = groupMemberRepository.findAllByBoardGroupId(boardId);

                List<MemberDTO> memberDTOs = members.stream()
                                .map(this::mapToMemberDTO)
                                .collect(Collectors.toList());

                return BoardDetailsDTO.builder()
                                .id(board.getBoardGroupId())
                                .name(board.getBoardGroupName())
                                .description(board.getGroupDescription())
                                .pictureUrl(board.getGroupPictureUrl())
                                .members(memberDTOs)
                                .build();
        }

        @Transactional
        public void removeMember(Long boardId, String emailToRemove, String requestingUserEmail) {
                GroupMember requestingAdmin = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, requestingUserEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                ERROR_ACCESS_DENIED_NOT_A_MEMBER_OF_BOARD));

                if (!requestingAdmin.getIsAdmin()) {
                        throw new AccessDeniedException(ERROR_ACCESS_DENIED_NOT_AN_ADMIN);
                }

                if (requestingUserEmail.equals(emailToRemove)) {
                        throw new IllegalArgumentException(ERROR_CANNOT_REMOVE_SELF);
                }

                GroupMember memberToRemove = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, emailToRemove)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Member with email " + emailToRemove + " not found in this board."));

                groupMemberRepository.delete(memberToRemove);
        }

        @Transactional
        public MemberDTO promoteMember(Long boardId, String emailToPromote, String requestingUserEmail) {
                GroupMember requestingAdmin = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, requestingUserEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                ERROR_ACCESS_DENIED_NOT_A_MEMBER_OF_BOARD));

                if (!requestingAdmin.getIsAdmin()) {
                        throw new AccessDeniedException(ERROR_ACCESS_DENIED_NOT_AN_ADMIN);
                }

                GroupMember memberToPromote = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, emailToPromote)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Member with email " + emailToPromote + " not found in this board."));

                if (memberToPromote.getIsAdmin()) {
                        throw new IllegalArgumentException(ERROR_USER_IS_ALREADY_ADMIN);
                }

                memberToPromote.setIsAdmin(true);
                groupMemberRepository.save(memberToPromote);

                return mapToMemberDTO(memberToPromote);
        }

        @Transactional
        public BoardDTO updateBoardName(Long boardId, String newName, String userEmail) {
                GroupMember member = groupMemberRepository.findByBoardGroupIdAndUserEmail(boardId, userEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                ERROR_ACCESS_DENIED_NOT_A_MEMBER_OF_BOARD));

                GroupBoard boardToUpdate = member.getGroupBoard();
                boardToUpdate.setBoardGroupName(newName);

                return mapToBoardResponse(member);
        }

        @Transactional
        public BoardDTO updateBoardDescription(Long boardId, String newDescription, String userEmail) {
                GroupMember member = groupMemberRepository.findByBoardGroupIdAndUserEmail(boardId, userEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                ERROR_ACCESS_DENIED_NOT_A_MEMBER_OF_BOARD));

                GroupBoard boardToUpdate = member.getGroupBoard();
                boardToUpdate.setGroupDescription(newDescription);

                return mapToBoardResponse(member);
        }

        @Transactional
        public void leaveBoard(Long boardId, String userEmail) {
                log.info("User {} is attempting to leave board {}", userEmail, boardId);

                GroupMember leavingMember = groupMemberRepository.findByBoardGroupIdAndUserEmail(boardId, userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("Cannot leave board: User " + userEmail
                                                + " is not a member of board " + boardId));

                if (!leavingMember.getIsAdmin()) {
                        log.info("User {} is a regular member. Removing from board {}.", userEmail, boardId);
                        groupMemberRepository.delete(leavingMember);
                        return;
                }

                log.info("User {} is an admin. Checking for other admins in board {}.", userEmail, boardId);
                List<GroupMember> allMembers = groupMemberRepository.findAllByBoardGroupId(boardId);
                long adminCount = allMembers.stream().filter(GroupMember::getIsAdmin).count();

                if (adminCount > 1) {
                        log.info("Other admins found. User {} can safely leave board {}.", userEmail, boardId);
                        groupMemberRepository.delete(leavingMember);
                        return;
                }

                log.warn("User {} is the last admin of board {}.", userEmail, boardId);

                if (allMembers.size() > 1) {
                        log.info("Promoting a new admin for board {}.", boardId);
                        groupMemberRepository.delete(leavingMember);

                        allMembers.stream()
                                        .filter(member -> !member.getUserEmail().equals(userEmail))
                                        .findFirst()
                                        .ifPresent(memberToPromote -> {
                                                log.warn("Promoting user {} to admin for board {}.",
                                                                memberToPromote.getUserEmail(), boardId);
                                                memberToPromote.setIsAdmin(true);
                                                groupMemberRepository.save(memberToPromote);
                                        });
                } else {
                        log.warn("User {} is the last member. Deleting board {}.", userEmail, boardId);
                        deleteBoardAndAssociatedData(boardId);
                }
        }

        private void deleteBoardAndAssociatedData(Long boardId) {
                log.info("Deleting all data associated with boardId {}", boardId);
                actionHistoryRepository.deleteAllByBoard_BoardGroupId(boardId);
                boardObjectRepository.deleteAllByBoard_BoardGroupId(boardId);
                groupMemberRepository.deleteAllByBoardGroupId(boardId);
                groupBoardRepository.deleteById(boardId);
                log.info("Successfully deleted board {}", boardId);
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

        private MemberDTO mapToMemberDTO(GroupMember membership) {
                return MemberDTO.builder()
                                .email(membership.getUser().getEmail())
                                .firstName(membership.getUser().getFirstName())
                                .lastName(membership.getUser().getLastName())
                                .profilePictureUrl(membership.getUser().getProfilePictureUrl())
                                .isAdmin(membership.getIsAdmin())
                                .build();
        }

        @Transactional
        public BoardDTO updateBoardPicture(Long boardId, MultipartFile file, String userEmail) {
                GroupMember member = groupMemberRepository.findByBoardGroupIdAndUserEmail(boardId, userEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                ERROR_ACCESS_DENIED_NOT_A_MEMBER_OF_BOARD));

                GroupBoard boardToUpdate = member.getGroupBoard();

                if (boardToUpdate.getGroupPictureUrl() != null && !boardToUpdate.getGroupPictureUrl().isBlank()) {
                        String fullUrl = boardToUpdate.getGroupPictureUrl();
                        String filename = fullUrl.substring(fullUrl.lastIndexOf("/") + 1);
                        fileStorageService.delete(filename);
                }

                String newFilename = fileStorageService.store(file);

                String newPictureUrl = "/images/" + newFilename;

                boardToUpdate.setGroupPictureUrl(newPictureUrl);

                return mapToBoardResponse(member);
        }

        @Transactional
        public BoardDTO deleteBoardPicture(Long boardId, String userEmail) {
                GroupMember member = groupMemberRepository.findByBoardGroupIdAndUserEmail(boardId, userEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                ERROR_ACCESS_DENIED_NOT_A_MEMBER_OF_BOARD));

                GroupBoard boardToUpdate = member.getGroupBoard();

                if (boardToUpdate.getGroupPictureUrl() != null && !boardToUpdate.getGroupPictureUrl().isBlank()) {
                        String fullUrl = boardToUpdate.getGroupPictureUrl();
                        String filename = fullUrl.substring(fullUrl.lastIndexOf("/") + 1);

                        fileStorageService.delete(filename);

                        boardToUpdate.setGroupPictureUrl(null);
                }

                return mapToBoardResponse(member);
        }
}