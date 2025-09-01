package io.github.sagimenahem.synchboard.service.user;

import static io.github.sagimenahem.synchboard.constants.FileConstants.IMAGES_BASE_PATH;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.CRITICAL_PREFIX;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.USER_ACCOUNT_DELETED;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.*;
import io.github.sagimenahem.synchboard.service.storage.FileStorageService;
import io.github.sagimenahem.synchboard.service.board.BoardMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAccountService {

    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ActionHistoryRepository actionHistoryRepository;
    private final BoardObjectRepository boardObjectRepository;
    private final GroupBoardRepository groupBoardRepository;
    private final MessageRepository messageRepository;
    private final FileStorageService fileStorageService;

    @Lazy
    private final BoardMemberService boardMemberService;

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
        boardIds.forEach(boardId -> {
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
        
        // Verify deletion
        boolean userStillExists = userRepository.existsById(userEmail);
        log.info("User deletion verification for {}: still exists in DB = {}", userEmail, userStillExists);
    }
}
