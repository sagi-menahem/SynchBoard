package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.FileConstants.IMAGES_BASE_PATH;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.board.BoardDTO;
import io.github.sagimenahem.synchboard.dto.board.BoardDetailsDTO;
import io.github.sagimenahem.synchboard.dto.board.CreateBoardRequest;
import io.github.sagimenahem.synchboard.dto.board.MemberDTO;
import io.github.sagimenahem.synchboard.dto.websocket.BoardUpdateDTO;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.GroupBoardRepository;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardService {

    private final GroupBoardRepository groupBoardRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final BoardNotificationService notificationService;

    @Transactional(readOnly = true)
    public List<BoardDTO> getBoardsForUser(String userEmail) {
        List<GroupMember> memberships = groupMemberRepository.findByUserWithBoard(userEmail);
        return memberships.stream().map(this::mapToBoardResponse).collect(Collectors.toList());
    }

    @Transactional
    public BoardDTO createBoard(CreateBoardRequest request, String ownerEmail) {
        User owner = userRepository.findById(ownerEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + ownerEmail));

        GroupBoard newBoard = GroupBoard.builder().boardGroupName(request.getName())
                .groupDescription(request.getDescription()).createdByUser(owner).build();
        groupBoardRepository.save(newBoard);

        GroupMember newMembership =
                GroupMember.builder().user(owner).groupBoard(newBoard).userEmail(owner.getEmail())
                        .boardGroupId(newBoard.getBoardGroupId()).isAdmin(true).build();
        groupMemberRepository.save(newMembership);

        notificationService.broadcastUserUpdate(ownerEmail);
        return mapToBoardResponse(newMembership);
    }

    @Transactional(readOnly = true)
    public BoardDetailsDTO getBoardDetails(Long boardId, String userEmail) {
        log.debug("Fetching board details for boardId {} by user {}", boardId, userEmail);
        
        if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
            log.warn("SECURITY: Non-member {} attempted to access board details for board {}", userEmail, boardId);
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }

        List<GroupMember> membersWithBoardAndUser = groupBoardRepository.findMembersWithDetails(boardId);
        
        if (membersWithBoardAndUser.isEmpty()) {
            throw new ResourceNotFoundException(MessageConstants.BOARD_NOT_FOUND + boardId);
        }

        GroupBoard board = membersWithBoardAndUser.get(0).getGroupBoard();
        List<MemberDTO> memberDTOs =
                membersWithBoardAndUser.stream().map(this::mapToMemberDTO).collect(Collectors.toList());

        return BoardDetailsDTO.builder().id(board.getBoardGroupId()).name(board.getBoardGroupName())
                .description(board.getGroupDescription()).pictureUrl(board.getGroupPictureUrl())
                .members(memberDTOs).build();
    }

    @Transactional
    public BoardDTO updateBoardName(Long boardId, String newName, String userEmail) {
        if (newName == null || newName.trim().isEmpty()) {
            throw new InvalidRequestException("Board name cannot be empty");
        }

        GroupMember member = groupMemberRepository
                .findByBoardGroupIdAndUserEmail(boardId, userEmail)
                .orElseThrow(() -> new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER));

        GroupBoard boardToUpdate = member.getGroupBoard();
        boardToUpdate.setBoardGroupName(newName.trim());

        notificationService.broadcastUserUpdatesToAllBoardMembers(boardId);

        notificationService.broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED,
                userEmail);
        return mapToBoardResponse(member);
    }

    @Transactional
    public BoardDTO updateBoardDescription(Long boardId, String newDescription, String userEmail) {
        String trimmedDescription = newDescription != null ? newDescription.trim() : null;

        GroupMember member = groupMemberRepository
                .findByBoardGroupIdAndUserEmail(boardId, userEmail)
                .orElseThrow(() -> new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER));

        GroupBoard boardToUpdate = member.getGroupBoard();
        boardToUpdate.setGroupDescription(trimmedDescription);

        notificationService.broadcastUserUpdatesToAllBoardMembers(boardId);

        notificationService.broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED,
                userEmail);
        return mapToBoardResponse(member);
    }

    @Transactional
    public BoardDTO updateBoardPicture(Long boardId, MultipartFile file, String userEmail) {
        GroupMember member = groupMemberRepository
                .findByBoardGroupIdAndUserEmail(boardId, userEmail)
                .orElseThrow(() -> new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER));

        GroupBoard boardToUpdate = member.getGroupBoard();
        deleteExistingPicture(boardToUpdate);

        String newFilename = fileStorageService.store(file);
        String newPictureUrl = IMAGES_BASE_PATH + newFilename;
        boardToUpdate.setGroupPictureUrl(newPictureUrl);

        notificationService.broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED,
                userEmail);
        notificationService.broadcastUserUpdatesToAllBoardMembers(boardId);

        log.info("Board picture updated successfully for board: {}", boardId);
        return mapToBoardResponse(member);
    }

    @Transactional
    public BoardDTO deleteBoardPicture(Long boardId, String userEmail) {
        GroupMember member = groupMemberRepository
                .findByBoardGroupIdAndUserEmail(boardId, userEmail)
                .orElseThrow(() -> new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER));

        GroupBoard boardToUpdate = member.getGroupBoard();

        deleteExistingPicture(boardToUpdate);
        boardToUpdate.setGroupPictureUrl(null);

        notificationService.broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED,
                userEmail);
        notificationService.broadcastUserUpdatesToAllBoardMembers(boardId);
        return mapToBoardResponse(member);
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
}
