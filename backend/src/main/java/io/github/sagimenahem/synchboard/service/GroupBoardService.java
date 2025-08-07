package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.config.constants.FileConstants.IMAGES_BASE_PATH;
import static io.github.sagimenahem.synchboard.config.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import static io.github.sagimenahem.synchboard.config.constants.WebSocketConstants.WEBSOCKET_USER_TOPIC_PREFIX;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.config.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.board.BoardDTO;
import io.github.sagimenahem.synchboard.dto.board.BoardDetailsDTO;
import io.github.sagimenahem.synchboard.dto.board.CreateBoardRequest;
import io.github.sagimenahem.synchboard.dto.board.MemberDTO;
import io.github.sagimenahem.synchboard.dto.websocket.BoardUpdateDTO;
import io.github.sagimenahem.synchboard.dto.websocket.UserUpdateDTO;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import io.github.sagimenahem.synchboard.exception.ResourceConflictException;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupBoardService {

        private static final Logger log = LoggerFactory.getLogger(GroupBoardService.class);

        private final GroupMemberRepository groupMemberRepository;
        private final GroupBoardRepository groupBoardRepository;
        private final UserRepository userRepository;
        private final ActionHistoryRepository actionHistoryRepository;
        private final BoardObjectRepository boardObjectRepository;
        private final MessageRepository messageRepository;
        private final FileStorageService fileStorageService;
        private final SimpMessageSendingOperations messagingTemplate;

        private void broadcastBoardUpdate(Long boardId, BoardUpdateDTO.UpdateType updateType,
                        String sourceUserEmail) {
                BoardUpdateDTO payload = new BoardUpdateDTO(updateType, sourceUserEmail);
                String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + boardId;

                log.info("Broadcasting update of type {} to destination {} from user {}",
                                updateType, destination, sourceUserEmail);
                messagingTemplate.convertAndSend(destination, payload);
        }

        private void broadcastUserUpdate(String userEmail) {
                UserUpdateDTO payload =
                                new UserUpdateDTO(UserUpdateDTO.UpdateType.BOARD_LIST_CHANGED);
                String destination = WEBSOCKET_USER_TOPIC_PREFIX + userEmail;
                log.info("Sending user-specific update to {}", destination);
                messagingTemplate.convertAndSend(destination, payload);
        }

        @Transactional(readOnly = true)
        public List<BoardDTO> getBoardsForUser(String userEmail) {
                List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
                return memberships.stream().map(this::mapToBoardResponse)
                                .collect(Collectors.toList());
        }

        @Transactional
        public BoardDTO createBoard(CreateBoardRequest request, String ownerEmail) {
                User owner = userRepository.findById(ownerEmail)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                MessageConstants.USER_NOT_FOUND + ownerEmail));

                GroupBoard newBoard = GroupBoard.builder().boardGroupName(request.getName())
                                .groupDescription(request.getDescription()).createdByUser(owner)
                                .build();
                groupBoardRepository.save(newBoard);

                GroupMember newMembership = GroupMember.builder().user(owner).groupBoard(newBoard)
                                .userEmail(owner.getEmail())
                                .boardGroupId(newBoard.getBoardGroupId()).isAdmin(true).build();
                groupMemberRepository.save(newMembership);

                broadcastUserUpdate(ownerEmail);
                return mapToBoardResponse(newMembership);
        }

        @Transactional
        public MemberDTO inviteMember(Long boardId, String invitedUserEmail,
                        String invitingUserEmail) {
                GroupMember invitingMember = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, invitingUserEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                MessageConstants.AUTH_NOT_MEMBER));

                if (!invitingMember.getIsAdmin()) {
                        throw new AccessDeniedException(MessageConstants.AUTH_NOT_ADMIN);
                }

                User userToInvite = userRepository.findById(invitedUserEmail).orElseThrow(
                                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND
                                                + invitedUserEmail));

                if (groupMemberRepository.existsByUserEmailAndBoardGroupId(invitedUserEmail,
                                boardId)) {
                        throw new ResourceConflictException(MessageConstants.USER_ALREADY_MEMBER);
                }

                GroupBoard board = invitingMember.getGroupBoard();
                GroupMember newMembership = GroupMember.builder().user(userToInvite)
                                .groupBoard(board).userEmail(userToInvite.getEmail())
                                .boardGroupId(board.getBoardGroupId()).isAdmin(false).build();

                groupMemberRepository.save(newMembership);

                broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.MEMBERS_UPDATED,
                                invitingUserEmail);
                broadcastUserUpdate(invitedUserEmail);
                return mapToMemberDTO(newMembership);
        }

        @Transactional(readOnly = true)
        public BoardDetailsDTO getBoardDetails(Long boardId, String userEmail) {
                if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
                        throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
                }

                GroupBoard board = groupBoardRepository.findById(boardId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                MessageConstants.BOARD_NOT_FOUND + boardId));

                List<GroupMember> members = groupMemberRepository.findAllByBoardGroupId(boardId);

                List<MemberDTO> memberDTOs = members.stream().map(this::mapToMemberDTO)
                                .collect(Collectors.toList());

                return BoardDetailsDTO.builder().id(board.getBoardGroupId())
                                .name(board.getBoardGroupName())
                                .description(board.getGroupDescription())
                                .pictureUrl(board.getGroupPictureUrl()).members(memberDTOs).build();
        }

        @Transactional
        public void removeMember(Long boardId, String emailToRemove, String requestingUserEmail) {
                GroupMember requestingAdmin = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, requestingUserEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                MessageConstants.AUTH_NOT_MEMBER));

                if (!requestingAdmin.getIsAdmin()) {
                        throw new AccessDeniedException(MessageConstants.AUTH_NOT_ADMIN);
                }

                if (requestingUserEmail.equals(emailToRemove)) {
                        throw new InvalidRequestException(
                                        MessageConstants.BOARD_CANNOT_REMOVE_SELF);
                }

                GroupMember memberToRemove = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, emailToRemove)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Member with email " + emailToRemove
                                                                + " not found in this board."));

                groupMemberRepository.delete(memberToRemove);

                broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.MEMBERS_UPDATED,
                                requestingUserEmail);
                broadcastUserUpdate(emailToRemove);
        }

        @Transactional
        public MemberDTO promoteMember(Long boardId, String emailToPromote,
                        String requestingUserEmail) {
                GroupMember requestingAdmin = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, requestingUserEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                MessageConstants.AUTH_NOT_MEMBER));

                if (!requestingAdmin.getIsAdmin()) {
                        throw new AccessDeniedException(MessageConstants.AUTH_NOT_ADMIN);
                }

                GroupMember memberToPromote = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, emailToPromote)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Member with email " + emailToPromote
                                                                + " not found in this board."));

                if (memberToPromote.getIsAdmin()) {
                        throw new ResourceConflictException(MessageConstants.USER_IS_ALREADY_ADMIN);
                }

                memberToPromote.setIsAdmin(true);
                groupMemberRepository.save(memberToPromote);

                broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.MEMBERS_UPDATED,
                                requestingUserEmail);
                broadcastUserUpdate(emailToPromote);
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

                broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.MEMBERS_UPDATED, userEmail);
                broadcastUserUpdate(userEmail);
        }

        @Transactional
        public BoardDTO updateBoardName(Long boardId, String newName, String userEmail) {
                if (newName == null || newName.trim().isEmpty()) {
                        throw new InvalidRequestException("Board name cannot be empty");
                }

                GroupMember member = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, userEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                MessageConstants.AUTH_NOT_MEMBER));

                GroupBoard boardToUpdate = member.getGroupBoard();
                boardToUpdate.setBoardGroupName(newName.trim());

                List<GroupMember> allMembers = groupMemberRepository.findAllByBoardGroupId(boardId);
                allMembers.forEach(m -> broadcastUserUpdate(m.getUserEmail()));

                broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED, userEmail);
                return mapToBoardResponse(member);
        }

        @Transactional
        public BoardDTO updateBoardDescription(Long boardId, String newDescription,
                        String userEmail) {
                String trimmedDescription = newDescription != null ? newDescription.trim() : null;

                GroupMember member = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, userEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                MessageConstants.AUTH_NOT_MEMBER));

                GroupBoard boardToUpdate = member.getGroupBoard();
                boardToUpdate.setGroupDescription(trimmedDescription);

                List<GroupMember> allMembers = groupMemberRepository.findAllByBoardGroupId(boardId);
                allMembers.forEach(m -> broadcastUserUpdate(m.getUserEmail()));

                broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED, userEmail);
                return mapToBoardResponse(member);
        }

        private void deleteBoardAndAssociatedData(Long boardId, String userEmail,
                        List<GroupMember> membersToNotify) {
                log.info("Deleting all data associated with boardId {} initiated by user {}",
                                boardId, userEmail);
                membersToNotify.forEach(member -> broadcastUserUpdate(member.getUserEmail()));

                try {
                        deleteBoardPicture(boardId, userEmail);
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
                        log.error("Error occurred while deleting board {} and associated data",
                                        boardId, e);
                        throw e;
                }
        }

        private BoardDTO mapToBoardResponse(GroupMember membership) {
                return BoardDTO.builder().id(membership.getGroupBoard().getBoardGroupId())
                                .name(membership.getGroupBoard().getBoardGroupName())
                                .description(membership.getGroupBoard().getGroupDescription())
                                .pictureUrl(membership.getGroupBoard().getGroupPictureUrl())
                                .lastModifiedDate(membership.getGroupBoard().getLastModifiedDate())
                                .isAdmin(membership.getIsAdmin()).build();
        }

        private MemberDTO mapToMemberDTO(GroupMember membership) {
                return MemberDTO.builder().email(membership.getUser().getEmail())
                                .firstName(membership.getUser().getFirstName())
                                .lastName(membership.getUser().getLastName())
                                .profilePictureUrl(membership.getUser().getProfilePictureUrl())
                                .isAdmin(membership.getIsAdmin()).build();
        }

        private void deleteExistingPicture(GroupBoard board) {
                String pictureUrl = board.getGroupPictureUrl();
                if (pictureUrl != null && !pictureUrl.isBlank()) {
                        int lastSlashIndex = pictureUrl.lastIndexOf("/");
                        if (lastSlashIndex != -1 && lastSlashIndex < pictureUrl.length() - 1) {
                                String filename = pictureUrl.substring(lastSlashIndex + 1);
                                fileStorageService.delete(filename);
                        }
                }
        }

        @Transactional
        public BoardDTO updateBoardPicture(Long boardId, MultipartFile file, String userEmail) {
                GroupMember member = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, userEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                MessageConstants.AUTH_NOT_MEMBER));

                GroupBoard boardToUpdate = member.getGroupBoard();

                deleteExistingPicture(boardToUpdate);

                String newFilename = fileStorageService.store(file);
                String newPictureUrl = IMAGES_BASE_PATH + newFilename;
                boardToUpdate.setGroupPictureUrl(newPictureUrl);

                broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED, userEmail);
                List<GroupMember> allMembers = groupMemberRepository.findAllByBoardGroupId(boardId);
                allMembers.forEach(m -> broadcastUserUpdate(m.getUserEmail()));
                return mapToBoardResponse(member);
        }

        @Transactional
        public BoardDTO deleteBoardPicture(Long boardId, String userEmail) {
                GroupMember member = groupMemberRepository
                                .findByBoardGroupIdAndUserEmail(boardId, userEmail)
                                .orElseThrow(() -> new AccessDeniedException(
                                                MessageConstants.AUTH_NOT_MEMBER));

                GroupBoard boardToUpdate = member.getGroupBoard();

                deleteExistingPicture(boardToUpdate);
                boardToUpdate.setGroupPictureUrl(null);

                broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED, userEmail);
                List<GroupMember> allMembers = groupMemberRepository.findAllByBoardGroupId(boardId);
                allMembers.forEach(m -> broadcastUserUpdate(m.getUserEmail()));
                return mapToBoardResponse(member);
        }
}
