package com.synchboard.backend.service;

import static com.synchboard.backend.config.constants.FileConstants.IMAGES_BASE_PATH;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import com.synchboard.backend.config.constants.MessageConstants;
import com.synchboard.backend.entity.GroupMember;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.exception.ResourceNotFoundException;
import com.synchboard.backend.repository.*;
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

        // נקה התייחסויות למשתמש בטבלאות אחרות
        boardObjectRepository.nullifyCreatedByUser(userEmail);
        boardObjectRepository.nullifyLastEditedByUser(userEmail);
        groupBoardRepository.nullifyCreatedByUser(userEmail);
        actionHistoryRepository.deleteAllByUser_Email(userEmail);
        messageRepository.nullifySenderByUserEmail(userEmail);

        // עזוב את כל הבורדים
        List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
        List<Long> boardIds =
                memberships.stream().map(GroupMember::getBoardGroupId).collect(Collectors.toList());
        boardIds.forEach(boardId -> groupBoardService.leaveBoard(boardId, userEmail));

        // מחק תמונת פרופיל אם קיימת
        if (StringUtils.hasText(user.getProfilePictureUrl())) {
            String existingFilename =
                    user.getProfilePictureUrl().substring(IMAGES_BASE_PATH.length());
            fileStorageService.delete(existingFilename);
        }

        // מחק את המשתמש
        userRepository.delete(user);
    }
}
