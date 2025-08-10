package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.FileConstants.IMAGES_BASE_PATH;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.ALLOWED_FONT_SIZES;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.user.UpdateUserProfileDTO;
import io.github.sagimenahem.synchboard.dto.user.UserPreferencesDTO;
import io.github.sagimenahem.synchboard.dto.user.UserProfileDTO;
import io.github.sagimenahem.synchboard.dto.websocket.BoardUpdateDTO;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final GroupMemberRepository groupMemberRepository;
    private final BoardNotificationService notificationService;

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
        List<Long> boardIds = memberships.stream()
                .map(GroupMember::getBoardGroupId)
                .toList();
        
        notificationService.broadcastBoardUpdatesToMultipleBoards(boardIds, 
                BoardUpdateDTO.UpdateType.MEMBERS_UPDATED, userEmail);
    }
}
