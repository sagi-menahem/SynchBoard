package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.board.MemberDTO;
import io.github.sagimenahem.synchboard.dto.websocket.BoardUpdateDTO;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import io.github.sagimenahem.synchboard.exception.ResourceConflictException;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardMemberService {

        private final GroupMemberRepository groupMemberRepository;
        private final GroupBoardRepository groupBoardRepository;
        private final UserRepository userRepository;
        private final ActionHistoryRepository actionHistoryRepository;
        private final BoardObjectRepository boardObjectRepository;
        private final MessageRepository messageRepository;
        private final FileStorageService fileStorageService;
        private final BoardNotificationService notificationService;

        @Transactional
        public MemberDTO inviteMember(Long boardId, String invitedUserEmail,
                        String invitingUserEmail) {
                log.debug(SECURITY_PREFIX + " Attempting to invite user {} to board {} by user {}",
                                invitedUserEmail, boardId, invitingUserEmail);

                GroupMember invitingMember = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, invitingUserEmail)
                                .orElseThrow(() -> {
                                        log.warn(AUTH_ACCESS_DENIED, invitingUserEmail,
                                                        "board " + boardId + " (invite member)");
                                        return new AccessDeniedException(
                                                        MessageConstants.AUTH_NOT_MEMBER);
                                });

                if (!invitingMember.getIsAdmin()) {
                        log.warn(SECURITY_PREFIX
                                        + " Non-admin {} attempted to invite user {} to board {}",
                                        invitingUserEmail, invitedUserEmail, boardId);
                        throw new AccessDeniedException(MessageConstants.AUTH_NOT_ADMIN);
                }

                // Check for self-invitation
                if (invitedUserEmail.equals(invitingUserEmail)) {
                        log.warn("Self-invitation attempt: user {} tried to invite themselves to board {}",
                                        invitingUserEmail, boardId);
                        throw new InvalidRequestException(MessageConstants.CANNOT_INVITE_SELF);
                }

                User userToInvite = userRepository.findById(invitedUserEmail).orElseThrow(
                                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND
                                                + invitedUserEmail));

                if (groupMemberRepository.existsByUserEmailAndBoardGroupId(invitedUserEmail,
                                boardId)) {
                        log.warn("Invitation failed: user {} is already a member of board {}",
                                        invitedUserEmail, boardId);
                        throw new ResourceConflictException(MessageConstants.USER_ALREADY_MEMBER);
                }

                GroupBoard board = invitingMember.getGroupBoard();
                GroupMember newMembership = GroupMember.builder().user(userToInvite)
                                .groupBoard(board).userEmail(userToInvite.getEmail())
                                .boardGroupId(board.getBoardGroupId()).isAdmin(false).build();

                groupMemberRepository.save(newMembership);
                log.info(BOARD_MEMBER_ADDED, boardId, invitedUserEmail, invitingUserEmail);

                notificationService.broadcastBoardUpdate(boardId,
                                BoardUpdateDTO.UpdateType.MEMBERS_UPDATED, invitingUserEmail);
                notificationService.broadcastUserUpdate(invitedUserEmail);
                return mapToMemberDTO(newMembership);
        }

        @Transactional
        public void removeMember(Long boardId, String emailToRemove, String requestingUserEmail) {
                log.debug("Attempting to remove user {} from board {} by user {}", emailToRemove,
                                boardId, requestingUserEmail);

                GroupMember requestingAdmin = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, requestingUserEmail)
                                .orElseThrow(() -> {
                                        log.warn(BOARD_ACCESS_DENIED, boardId, requestingUserEmail);
                                        return new AccessDeniedException(
                                                        MessageConstants.AUTH_NOT_MEMBER);
                                });

                if (!requestingAdmin.getIsAdmin()) {
                        log.warn(SECURITY_PREFIX
                                        + " Non-admin {} attempted to remove user {} from board {}",
                                        requestingUserEmail, emailToRemove, boardId);
                        throw new AccessDeniedException(MessageConstants.AUTH_NOT_ADMIN);
                }

                if (requestingUserEmail.equals(emailToRemove)) {
                        log.warn("Invalid request: admin {} attempted to remove themselves from board {}",
                                        requestingUserEmail, boardId);
                        throw new InvalidRequestException(
                                        MessageConstants.BOARD_CANNOT_REMOVE_SELF);
                }

                GroupMember memberToRemove = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, emailToRemove)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Member with email " + emailToRemove
                                                                + " not found in this board."));

                groupMemberRepository.delete(memberToRemove);
                log.info(BOARD_MEMBER_REMOVED, boardId, emailToRemove, requestingUserEmail);

                notificationService.broadcastBoardUpdate(boardId,
                                BoardUpdateDTO.UpdateType.MEMBERS_UPDATED, requestingUserEmail);
                notificationService.broadcastUserUpdate(emailToRemove);
        }

        @Transactional
        public MemberDTO promoteMember(Long boardId, String emailToPromote,
                        String requestingUserEmail) {
                log.debug("Attempting to promote user {} to admin in board {} by user {}",
                                emailToPromote, boardId, requestingUserEmail);

                GroupMember requestingAdmin = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, requestingUserEmail)
                                .orElseThrow(() -> {
                                        log.warn(BOARD_ACCESS_DENIED, boardId, requestingUserEmail);
                                        return new AccessDeniedException(
                                                        MessageConstants.AUTH_NOT_MEMBER);
                                });

                if (!requestingAdmin.getIsAdmin()) {
                        log.warn(SECURITY_PREFIX
                                        + " Non-admin {} attempted to promote user {} in board {}",
                                        requestingUserEmail, emailToPromote, boardId);
                        throw new AccessDeniedException(MessageConstants.AUTH_NOT_ADMIN);
                }

                GroupMember memberToPromote = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, emailToPromote)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Member with email " + emailToPromote
                                                                + " not found in this board."));

                if (memberToPromote.getIsAdmin()) {
                        log.warn("Promotion failed: user {} is already admin of board {}",
                                        emailToPromote, boardId);
                        throw new ResourceConflictException(MessageConstants.USER_IS_ALREADY_ADMIN);
                }

                memberToPromote.setIsAdmin(true);
                groupMemberRepository.save(memberToPromote);
                log.info(BOARD_MEMBER_PROMOTED, boardId, emailToPromote, requestingUserEmail);

                notificationService.broadcastBoardUpdate(boardId,
                                BoardUpdateDTO.UpdateType.MEMBERS_UPDATED, requestingUserEmail);

                notificationService.broadcastUserDetailsChanged(emailToPromote);
                return mapToMemberDTO(memberToPromote);
        }

        @Transactional
        public void leaveBoard(Long boardId, String userEmail) {
                log.info("User {} is attempting to leave board {}", userEmail, boardId);

                GroupMember leavingMember = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Cannot leave board: User " + userEmail
                                                                + " is not a member of board "
                                                                + boardId));

                List<GroupMember> allMembers = groupMemberRepository.findAllByBoardGroupId(boardId);

                if (leavingMember.getIsAdmin()) {
                        log.info("User {} is an admin. Checking for other admins in board {}.",
                                        userEmail, boardId);
                        long adminCount =
                                        allMembers.stream().filter(GroupMember::getIsAdmin).count();

                        if (adminCount <= 1) {
                                log.warn("User {} is the last admin of board {}.", userEmail,
                                                boardId);

                                if (allMembers.size() > 1) {
                                        log.info("Promoting a new admin for board {}.", boardId);
                                        allMembers.stream()
                                                        .filter(member -> !member.getUserEmail()
                                                                        .equals(userEmail))
                                                        .findFirst().ifPresent(memberToPromote -> {
                                                                log.warn("Promoting user {} to admin for board {}.",
                                                                                memberToPromote.getUserEmail(),
                                                                                boardId);
                                                                memberToPromote.setIsAdmin(true);
                                                                groupMemberRepository.save(
                                                                                memberToPromote);
                                                        });
                                } else {
                                        log.warn("User {} is the last member. Deleting board {}.",
                                                        userEmail, boardId);
                                        deleteBoardAndAssociatedData(boardId, userEmail,
                                                        allMembers);
                                        return;
                                }
                        }
                }

                groupMemberRepository.delete(leavingMember);
                log.info(BOARD_MEMBER_LEFT, boardId, userEmail);

                notificationService.broadcastBoardUpdate(boardId,
                                BoardUpdateDTO.UpdateType.MEMBERS_UPDATED, userEmail);
                notificationService.broadcastUserUpdate(userEmail);
        }

        private void deleteBoardAndAssociatedData(Long boardId, String userEmail,
                        List<GroupMember> membersToNotify) {
                log.info("Deleting all data associated with boardId {} initiated by user {}",
                                boardId, userEmail);
                List<String> memberEmails =
                                membersToNotify.stream().map(GroupMember::getUserEmail).toList();
                notificationService.broadcastUserUpdatesToUsers(memberEmails);

                try {
                        GroupBoard board = groupBoardRepository.findById(boardId).orElse(null);
                        if (board != null && board.getGroupPictureUrl() != null) {
                                deleteExistingPicture(board);
                        }
                        log.debug("Deleted board picture for board {}", boardId);

                        messageRepository.deleteAllByBoard_BoardGroupId(boardId);
                        log.debug("Deleted messages for board {}", boardId);

                        actionHistoryRepository.deleteAllByBoard_BoardGroupId(boardId);
                        log.debug("Deleted action history for board {}", boardId);

                        boardObjectRepository.deleteAllByBoard_BoardGroupId(boardId);
                        log.debug("Deleted board objects for board {}", boardId);

                        groupMemberRepository.deleteAllByBoardGroupId(boardId);
                        log.debug("Deleted group members for board {}", boardId);

                        groupBoardRepository.deleteById(boardId);
                        log.info("Successfully deleted board {} and all associated data", boardId);
                } catch (Exception e) {
                        log.error("Error occurred while deleting board {} and associated data. "
                                        + "Board may be in inconsistent state.", boardId, e);
                        throw new RuntimeException("Failed to completely delete board " + boardId
                                        + ". Please contact administrator to verify data consistency.",
                                        e);
                }
        }

        private void deleteExistingPicture(GroupBoard board) {
                String pictureUrl = board.getGroupPictureUrl();
                if (pictureUrl != null && !pictureUrl.isBlank()) {
                        int lastSlashIndex = pictureUrl.lastIndexOf("/");
                        if (lastSlashIndex != -1 && lastSlashIndex < pictureUrl.length() - 1) {
                                String filename = pictureUrl.substring(lastSlashIndex + 1);
                                if (filename != null && !filename.isBlank()) {
                                        try {
                                                fileStorageService.delete(filename);
                                                log.debug("Existing board picture deleted during board cleanup: {}",
                                                                filename);
                                        } catch (Exception e) {
                                                log.warn("Failed to delete board picture file during cleanup: {} - {}",
                                                                filename, e.getMessage());
                                        }
                                }
                        }
                }
        }

        private MemberDTO mapToMemberDTO(GroupMember membership) {
                return MemberDTO.builder().email(membership.getUser().getEmail())
                                .firstName(membership.getUser().getFirstName())
                                .lastName(membership.getUser().getLastName())
                                .profilePictureUrl(membership.getUser().getProfilePictureUrl())
                                .isAdmin(membership.getIsAdmin()).build();
        }
}
