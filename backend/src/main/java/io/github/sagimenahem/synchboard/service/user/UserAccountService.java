package io.github.sagimenahem.synchboard.service.user;

import static io.github.sagimenahem.synchboard.constants.FileConstants.IMAGES_BASE_PATH;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.CRITICAL_PREFIX;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.USER_ACCOUNT_DELETED;

import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.*;
import io.github.sagimenahem.synchboard.service.board.BoardMemberService;
import io.github.sagimenahem.synchboard.service.storage.FileStorageService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Service for managing user account lifecycle operations. Handles critical operations like account
 * deletion with proper data cleanup, reference nullification, and file cleanup to maintain data
 * integrity.
 * 
 * @author Sagi Menahem
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserAccountService {

    /** Repository for user data operations */
    private final UserRepository userRepository;
    /** Repository for board membership management */
    private final GroupMemberRepository groupMemberRepository;
    /** Repository for user action history */
    private final ActionHistoryRepository actionHistoryRepository;
    /** Repository for board objects */
    private final BoardObjectRepository boardObjectRepository;
    /** Repository for board data operations */
    private final GroupBoardRepository groupBoardRepository;
    /** Repository for chat messages */
    private final MessageRepository messageRepository;
    /** Service for file storage operations */
    private final FileStorageService fileStorageService;

    /** Service for board membership operations (lazy to avoid circular dependency) */
    @Lazy
    private final BoardMemberService boardMemberService;

    /**
     * Permanently deletes a user account and all associated data. Performs comprehensive cleanup
     * including: - Nullifying foreign key references to maintain data integrity - Removing user
     * from all board memberships - Deleting action history - Cleaning up profile pictures - Final
     * user record deletion
     * 
     * @param userEmail The email of the user account to delete
     * @throws ResourceNotFoundException if the user is not found
     */
    @Transactional
    public void deleteAccount(String userEmail) {
        log.warn(CRITICAL_PREFIX + " Account deletion initiated for user: {}", userEmail);

        User user = userRepository.findById(userEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        log.info("Starting data cleanup for user: {}", userEmail);

        boardObjectRepository.nullifyCreatedByUser(userEmail);
        log.debug("Nullified board object creator references for user: {}", userEmail);

        boardObjectRepository.nullifyLastEditedByUser(userEmail);
        log.debug("Nullified board object editor references for user: {}", userEmail);

        groupBoardRepository.nullifyCreatedByUser(userEmail);
        log.debug("Nullified board creator references for user: {}", userEmail);

        actionHistoryRepository.deleteAllByUser_Email(userEmail);
        log.debug("Deleted action history for user: {}", userEmail);

        messageRepository.nullifySenderByUserEmail(userEmail);
        log.debug("Nullified message sender references for user: {}", userEmail);

        List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
        List<Long> boardIds =
                memberships.stream().map(GroupMember::getBoardGroupId).collect(Collectors.toList());

        log.info("User {} is member of {} boards, initiating board leave process", userEmail,
                boardIds.size());
        boardIds.forEach((boardId) -> {
            log.debug("Processing board leave for user {} from board {}", userEmail, boardId);
            boardMemberService.leaveBoard(boardId, userEmail);
        });

        if (StringUtils.hasText(user.getProfilePictureUrl())) {
            String existingFilename =
                    user.getProfilePictureUrl().substring(IMAGES_BASE_PATH.length());
            log.debug("Deleting profile picture file: {} for user: {}", existingFilename,
                    userEmail);
            fileStorageService.delete(existingFilename);
        }

        log.info("About to delete user from database: {}", userEmail);
        userRepository.delete(user);
        log.warn(USER_ACCOUNT_DELETED, userEmail);

        boolean userStillExists = userRepository.existsById(userEmail);
        log.info("User deletion verification for {}: still exists in DB = {}", userEmail,
                userStillExists);
    }
}
