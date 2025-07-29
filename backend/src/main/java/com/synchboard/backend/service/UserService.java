// File: backend/src/main/java/com/synchboard/backend/service/UserService.java
package com.synchboard.backend.service;

import static com.synchboard.backend.config.constants.FileConstants.IMAGES_BASE_PATH;
import static com.synchboard.backend.config.constants.MessageConstants.ALLOWED_FONT_SIZES;
import static com.synchboard.backend.config.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import java.util.List;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.synchboard.backend.config.constants.MessageConstants;
import com.synchboard.backend.dto.user.UpdateUserProfileDTO;
import com.synchboard.backend.dto.user.UserPreferencesDTO;
import com.synchboard.backend.dto.user.UserProfileDTO;
import com.synchboard.backend.dto.websocket.BoardUpdateDTO;
import com.synchboard.backend.entity.GroupMember;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.exception.InvalidRequestException;
import com.synchboard.backend.exception.ResourceNotFoundException;
import com.synchboard.backend.repository.GroupMemberRepository;
import com.synchboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final GroupMemberRepository groupMemberRepository;
    private final SimpMessageSendingOperations messagingTemplate;

    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(String userEmail) {
        User user = userRepository.findById(userEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        return mapUserToUserProfileDTO(user);
    }

    @Transactional
    public UserProfileDTO updateUserProfile(String userEmail, UpdateUserProfileDTO dto) {
        User user = userRepository.findById(userEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());

        User updatedUser = userRepository.save(user);

        broadcastUserUpdateToSharedBoards(userEmail);
        return mapUserToUserProfileDTO(updatedUser);
    }

    @Transactional
    public UserProfileDTO updateProfilePicture(String userEmail, MultipartFile file) {
        User user = userRepository.findById(userEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        if (StringUtils.hasText(user.getProfilePictureUrl())) {
            String existingFilename =
                    user.getProfilePictureUrl().substring(IMAGES_BASE_PATH.length());
            fileStorageService.delete(existingFilename);
        }

        String newFilename = fileStorageService.store(file);
        String newPictureUrl = IMAGES_BASE_PATH + newFilename;
        user.setProfilePictureUrl(newPictureUrl);

        User updatedUser = userRepository.save(user);

        broadcastUserUpdateToSharedBoards(userEmail);
        return mapUserToUserProfileDTO(updatedUser);
    }

    @Transactional
    public UserProfileDTO deleteProfilePicture(String userEmail) {
        User user = userRepository.findById(userEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        if (StringUtils.hasText(user.getProfilePictureUrl())) {
            String existingFilename =
                    user.getProfilePictureUrl().substring(IMAGES_BASE_PATH.length());
            fileStorageService.delete(existingFilename);
            user.setProfilePictureUrl(null);
            userRepository.save(user);
        }

        broadcastUserUpdateToSharedBoards(userEmail);
        return mapUserToUserProfileDTO(user);
    }

    @Transactional
    public UserProfileDTO updateUserPreferences(String userEmail, UserPreferencesDTO dto) {
        User user = userRepository.findById(userEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        String newFontSize = dto.getFontSizeSetting();
        if (newFontSize != null && !ALLOWED_FONT_SIZES.contains(newFontSize)) {
            throw new InvalidRequestException(MessageConstants.FONT_SIZE_INVALID);
        }

        user.setChatBackgroundSetting(dto.getChatBackgroundSetting());
        user.setFontSizeSetting(newFontSize);

        User updatedUser = userRepository.save(user);
        return mapUserToUserProfileDTO(updatedUser);
    }

    private UserProfileDTO mapUserToUserProfileDTO(User user) {
        return UserProfileDTO.builder().email(user.getEmail()).firstName(user.getFirstName())
                .lastName(user.getLastName()).phoneNumber(user.getPhoneNumber())
                .profilePictureUrl(user.getProfilePictureUrl())
                .chatBackgroundSetting(user.getChatBackgroundSetting())
                .fontSizeSetting(user.getFontSizeSetting()).build();
    }

    private void broadcastUserUpdateToSharedBoards(String userEmail) {
        List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
        BoardUpdateDTO payload =
                new BoardUpdateDTO(BoardUpdateDTO.UpdateType.MEMBERS_UPDATED, userEmail);

        for (GroupMember membership : memberships) {
            Long boardId = membership.getBoardGroupId();
            String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + boardId;
            messagingTemplate.convertAndSend(destination, payload);
        }
    }
}
