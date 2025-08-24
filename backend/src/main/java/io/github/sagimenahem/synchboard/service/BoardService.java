package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;
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
import io.github.sagimenahem.synchboard.dto.board.UpdateCanvasSettingsRequest;
import io.github.sagimenahem.synchboard.dto.websocket.BoardUpdateDTO;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import io.github.sagimenahem.synchboard.exception.ResourceConflictException;
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
    private final BoardMemberService boardMemberService;

    @Transactional(readOnly = true)
    public List<BoardDTO> getBoardsForUser(String userEmail) {
        log.debug("Fetching boards for user: {}", userEmail);

        List<GroupMember> memberships = groupMemberRepository.findByUserWithBoard(userEmail);
        List<BoardDTO> boards =
                memberships.stream().map(this::mapToBoardResponse).collect(Collectors.toList());

        log.debug("Found {} boards for user: {}", boards.size(), userEmail);
        return boards;
    }

    @Transactional
    public BoardDTO createBoard(CreateBoardRequest request, String ownerEmail) {
        log.debug("Creating board: {} for user: {}", request.getName(), ownerEmail);

        User owner = userRepository.findById(ownerEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, ownerEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + ownerEmail);
        });

        GroupBoard newBoard = GroupBoard.builder().boardGroupName(request.getName())
                .groupDescription(request.getDescription()).createdByUser(owner)
                .canvasBackgroundColor(request.getCanvasBackgroundColor())
                .canvasWidth(request.getCanvasWidth())
                .canvasHeight(request.getCanvasHeight())
                .build();

        // Handle board picture upload if provided
        if (request.getPicture() != null && !request.getPicture().isEmpty()) {
            try {
                String pictureUrl = fileStorageService.store(request.getPicture());
                newBoard.setGroupPictureUrl(pictureUrl);
                log.debug("Board picture uploaded: {}", pictureUrl);
            } catch (Exception e) {
                log.warn("Failed to upload board picture during creation: {}", e.getMessage());
                // Continue without picture - not a critical failure
            }
        }

        groupBoardRepository.save(newBoard);

        GroupMember newMembership =
                GroupMember.builder().user(owner).groupBoard(newBoard).userEmail(owner.getEmail())
                        .boardGroupId(newBoard.getBoardGroupId()).isAdmin(true).build();
        groupMemberRepository.save(newMembership);

        log.info(BOARD_CREATED, newBoard.getBoardGroupId(), request.getName(), ownerEmail);

        // Handle member invitations if provided
        if (request.getInviteEmails() != null && !request.getInviteEmails().isEmpty()) {
            inviteMembers(newBoard.getBoardGroupId(), request.getInviteEmails(), ownerEmail);
        }

        notificationService.broadcastUserUpdate(ownerEmail);
        return mapToBoardResponse(newMembership);
    }

    @Transactional(readOnly = true)
    public BoardDetailsDTO getBoardDetails(Long boardId, String userEmail) {
        log.debug(BOARD_ACCESS_ATTEMPT, boardId, userEmail);

        if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
            log.warn(BOARD_ACCESS_DENIED, boardId, userEmail);
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }

        log.debug(BOARD_ACCESS_GRANTED, boardId, userEmail);
        List<GroupMember> membersWithBoardAndUser =
                groupBoardRepository.findMembersWithDetails(boardId);

        if (membersWithBoardAndUser.isEmpty()) {
            log.warn("Board not found: {}", boardId);
            throw new ResourceNotFoundException(MessageConstants.BOARD_NOT_FOUND + boardId);
        }

        GroupBoard board = membersWithBoardAndUser.get(0).getGroupBoard();
        List<MemberDTO> memberDTOs = membersWithBoardAndUser.stream().map(this::mapToMemberDTO)
                .collect(Collectors.toList());

        log.debug("Board details fetched successfully. BoardId: {}, Members: {}", boardId,
                memberDTOs.size());
        return BoardDetailsDTO.builder().id(board.getBoardGroupId()).name(board.getBoardGroupName())
                .description(board.getGroupDescription()).pictureUrl(board.getGroupPictureUrl())
                .members(memberDTOs)
                .canvasBackgroundColor(board.getCanvasBackgroundColor())
                .canvasWidth(board.getCanvasWidth())
                .canvasHeight(board.getCanvasHeight())
                .build();
    }

    @Transactional
    public BoardDTO updateBoardName(Long boardId, String newName, String userEmail) {
        log.debug("Updating board name. BoardId: {}, NewName: {}, User: {}", boardId, newName,
                userEmail);

        if (newName == null || newName.trim().isEmpty()) {
            log.warn(ERROR_VALIDATION, "boardName", newName, "cannot be empty");
            throw new InvalidRequestException("Board name cannot be empty");
        }

        GroupMember member = groupMemberRepository
                .findByBoardGroupIdAndUserEmail(boardId, userEmail).orElseThrow(() -> {
                    log.warn(BOARD_ACCESS_DENIED, boardId, userEmail);
                    return new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
                });

        String oldName = member.getGroupBoard().getBoardGroupName();
        GroupBoard boardToUpdate = member.getGroupBoard();
        boardToUpdate.setBoardGroupName(newName.trim());

        log.info(BOARD_UPDATED, boardId, "name (" + oldName + " -> " + newName.trim() + ")",
                userEmail);

        notificationService.broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED,
                userEmail);
        notificationService.broadcastBoardDetailsChangedToAllBoardMembers(boardId);
        return mapToBoardResponse(member);
    }

    @Transactional
    public BoardDTO updateBoardDescription(Long boardId, String newDescription, String userEmail) {
        log.debug("Updating board description. BoardId: {}, User: {}", boardId, userEmail);

        String trimmedDescription = newDescription != null ? newDescription.trim() : null;

        GroupMember member = groupMemberRepository
                .findByBoardGroupIdAndUserEmail(boardId, userEmail).orElseThrow(() -> {
                    log.warn(BOARD_ACCESS_DENIED, boardId, userEmail);
                    return new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
                });

        GroupBoard boardToUpdate = member.getGroupBoard();
        String oldDescription = boardToUpdate.getGroupDescription();
        boardToUpdate.setGroupDescription(trimmedDescription);

        log.info(BOARD_UPDATED, boardId, "description", userEmail);
        log.debug("Board description changed from '{}' to '{}'", oldDescription,
                trimmedDescription);

        notificationService.broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED,
                userEmail);
        notificationService.broadcastBoardDetailsChangedToAllBoardMembers(boardId);
        return mapToBoardResponse(member);
    }

    @Transactional
    public BoardDTO updateBoardPicture(Long boardId, MultipartFile file, String userEmail) {
        log.debug(FILE_UPLOAD_STARTED, file.getOriginalFilename(), userEmail, file.getSize());
        log.debug("Updating board picture. BoardId: {}, User: {}", boardId, userEmail);

        GroupMember member = groupMemberRepository
                .findByBoardGroupIdAndUserEmail(boardId, userEmail).orElseThrow(() -> {
                    log.warn(BOARD_ACCESS_DENIED, boardId, userEmail);
                    return new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
                });

        GroupBoard boardToUpdate = member.getGroupBoard();
        deleteExistingPicture(boardToUpdate);

        String newPictureUrl = fileStorageService.store(file);
        boardToUpdate.setGroupPictureUrl(newPictureUrl);

        log.info(BOARD_UPDATED, boardId, "picture", userEmail);
        log.info(FILE_UPLOAD_SUCCESS, newPictureUrl, userEmail);

        notificationService.broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED,
                userEmail);
        notificationService.broadcastBoardDetailsChangedToAllBoardMembers(boardId);

        return mapToBoardResponse(member);
    }

    @Transactional
    public BoardDTO deleteBoardPicture(Long boardId, String userEmail) {
        log.debug("Deleting board picture. BoardId: {}, User: {}", boardId, userEmail);

        GroupMember member = groupMemberRepository
                .findByBoardGroupIdAndUserEmail(boardId, userEmail).orElseThrow(() -> {
                    log.warn(BOARD_ACCESS_DENIED, boardId, userEmail);
                    return new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
                });

        GroupBoard boardToUpdate = member.getGroupBoard();
        String oldPictureUrl = boardToUpdate.getGroupPictureUrl();

        deleteExistingPicture(boardToUpdate);
        boardToUpdate.setGroupPictureUrl(null);

        log.info(BOARD_UPDATED, boardId, "picture (deleted)", userEmail);
        if (oldPictureUrl != null) {
            log.info(FILE_DELETE_SUCCESS, oldPictureUrl, userEmail);
        }

        notificationService.broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.DETAILS_UPDATED,
                userEmail);
        notificationService.broadcastBoardDetailsChangedToAllBoardMembers(boardId);
        return mapToBoardResponse(member);
    }

    private void deleteExistingPicture(GroupBoard board) {
        String pictureUrl = board.getGroupPictureUrl();
        if (pictureUrl != null && !pictureUrl.isBlank()) {
            String filename = extractFilenameFromPictureUrl(pictureUrl);
            if (filename != null && !filename.isBlank()) {
                try {
                    fileStorageService.delete(filename);
                    log.debug("Existing board picture deleted: {}", filename);
                } catch (Exception e) {
                    log.warn(FILE_DELETE_FAILED, filename, e.getMessage());
                }
            }
        }
    }

    private String extractFilenameFromPictureUrl(String pictureUrl) {
        if (pictureUrl == null || pictureUrl.isBlank()) {
            return null;
        }

        int lastSlashIndex = pictureUrl.lastIndexOf("/");
        if (lastSlashIndex != -1 && lastSlashIndex < pictureUrl.length() - 1) {
            return pictureUrl.substring(lastSlashIndex + 1);
        }

        return null;
    }

    private BoardDTO mapToBoardResponse(GroupMember membership) {
        return BoardDTO.builder().id(membership.getGroupBoard().getBoardGroupId())
                .name(membership.getGroupBoard().getBoardGroupName())
                .description(membership.getGroupBoard().getGroupDescription())
                .pictureUrl(membership.getGroupBoard().getGroupPictureUrl())
                .lastModifiedDate(membership.getGroupBoard().getLastModifiedDate())
                .isAdmin(membership.getIsAdmin())
                .canvasBackgroundColor(membership.getGroupBoard().getCanvasBackgroundColor())
                .canvasWidth(membership.getGroupBoard().getCanvasWidth())
                .canvasHeight(membership.getGroupBoard().getCanvasHeight())
                .build();
    }

    private MemberDTO mapToMemberDTO(GroupMember membership) {
        return MemberDTO.builder().email(membership.getUser().getEmail())
                .firstName(membership.getUser().getFirstName())
                .lastName(membership.getUser().getLastName())
                .profilePictureUrl(membership.getUser().getProfilePictureUrl())
                .isAdmin(membership.getIsAdmin()).build();
    }

    private void inviteMembers(Long boardId, List<String> inviteEmails, String invitingUserEmail) {
        if (inviteEmails == null || inviteEmails.isEmpty()) {
            return;
        }

        int successfulInvites = 0;
        int failedInvites = 0;

        for (String email : inviteEmails) {
            if (email != null && !email.trim().isEmpty()) {
                try {
                    boardMemberService.inviteMember(boardId, email.trim(), invitingUserEmail);
                    successfulInvites++;
                    log.debug("Successfully invited {} to board {}", email, boardId);
                } catch (InvalidRequestException e) {
                    failedInvites++;
                    log.warn("Invalid invitation request for {} to board {}: {}", email, boardId, e.getMessage());
                } catch (ResourceNotFoundException e) {
                    failedInvites++;
                    log.warn("User {} not found when inviting to board {}", email, boardId);
                } catch (ResourceConflictException e) {
                    failedInvites++;
                    log.warn("User {} is already a member of board {}", email, boardId);
                } catch (Exception e) {
                    failedInvites++;
                    log.warn("Failed to invite {} to board {}: {}", email, boardId, e.getMessage());
                }
            }
        }

        log.info("Board {} creation: {} successful invites, {} failed invites", 
                 boardId, successfulInvites, failedInvites);
    }

    @Transactional
    public BoardDTO updateCanvasSettings(Long boardId, UpdateCanvasSettingsRequest request, String userEmail) {
        log.debug("Updating canvas settings. BoardId: {}, User: {}", boardId, userEmail);

        GroupMember member = groupMemberRepository
                .findByBoardGroupIdAndUserEmail(boardId, userEmail).orElseThrow(() -> {
                    log.warn(BOARD_ACCESS_DENIED, boardId, userEmail);
                    return new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
                });

        if (!member.getIsAdmin()) {
            log.warn("Non-admin user {} attempted to update canvas settings for board {}", userEmail, boardId);
            throw new AccessDeniedException("Only board administrators can update canvas settings");
        }

        GroupBoard boardToUpdate = member.getGroupBoard();
        
        if (request.getCanvasBackgroundColor() != null) {
            boardToUpdate.setCanvasBackgroundColor(request.getCanvasBackgroundColor());
        }
        if (request.getCanvasWidth() != null) {
            boardToUpdate.setCanvasWidth(request.getCanvasWidth());
        }
        if (request.getCanvasHeight() != null) {
            boardToUpdate.setCanvasHeight(request.getCanvasHeight());
        }

        groupBoardRepository.save(boardToUpdate);

        log.info(BOARD_UPDATED, boardId, "canvas settings", userEmail);

        notificationService.broadcastBoardUpdate(boardId, BoardUpdateDTO.UpdateType.CANVAS_UPDATED, userEmail);
        notificationService.broadcastBoardDetailsChangedToAllBoardMembers(boardId);

        return mapToBoardResponse(member);
    }
}
