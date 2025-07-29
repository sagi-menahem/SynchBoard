package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.config.constants.FileConstants.IMAGES_BASE_PATH;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import io.github.sagimenahem.synchboard.config.constants.MessageConstants;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.*;
import lombok.RequiredArgsConstructor;

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
    private final GroupBoardService groupBoardService;

    @Transactional
    public void deleteAccount(String userEmail) {
        User user = userRepository.findById(userEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        boardObjectRepository.nullifyCreatedByUser(userEmail);
        boardObjectRepository.nullifyLastEditedByUser(userEmail);
        groupBoardRepository.nullifyCreatedByUser(userEmail);
        actionHistoryRepository.deleteAllByUser_Email(userEmail);
        messageRepository.nullifySenderByUserEmail(userEmail);

        List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
        List<Long> boardIds =
                memberships.stream().map(GroupMember::getBoardGroupId).collect(Collectors.toList());
        boardIds.forEach(boardId -> groupBoardService.leaveBoard(boardId, userEmail));

        if (StringUtils.hasText(user.getProfilePictureUrl())) {
            String existingFilename =
                    user.getProfilePictureUrl().substring(IMAGES_BASE_PATH.length());
            fileStorageService.delete(existingFilename);
        }

        userRepository.delete(user);
    }
}
