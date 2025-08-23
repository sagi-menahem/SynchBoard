package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.FileConstants.IMAGES_BASE_PATH;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.user.UpdateUserProfileRequest;
import io.github.sagimenahem.synchboard.dto.user.UserPreferencesDTO;
import io.github.sagimenahem.synchboard.dto.user.UserProfileDTO;
import io.github.sagimenahem.synchboard.dto.websocket.BoardUpdateDTO;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final GroupMemberRepository groupMemberRepository;
    private final BoardNotificationService notificationService;

    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(String userEmail) {
        log.debug(DATA_PREFIX + " Fetching user profile for: {}", userEmail);

        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });

        log.debug(USER_PROFILE_FETCHED, userEmail);
        return mapUserToUserProfileDTO(user);
    }

    @Transactional
    public UserProfileDTO updateUserProfile(String userEmail, UpdateUserProfileRequest dto) {
        log.info(DATA_PREFIX + " Updating user profile for: {}", userEmail);

        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setGender(dto.getGender());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setDateOfBirth(dto.getDateOfBirth());

        User updatedUser = userRepository.save(user);
        log.info(USER_PROFILE_UPDATED, userEmail, "firstName, lastName, gender, phoneNumber, dateOfBirth");

        broadcastUserUpdateToSharedBoards(userEmail);
        return mapUserToUserProfileDTO(updatedUser);
    }

    @Transactional
    public UserProfileDTO updateProfilePicture(String userEmail, MultipartFile file) {
        log.info(FILE_UPLOAD_STARTED, file.getOriginalFilename(), userEmail, file.getSize());

        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });

        if (StringUtils.hasText(user.getProfilePictureUrl())) {
            String existingFilename =
                    user.getProfilePictureUrl().substring(IMAGES_BASE_PATH.length());
            log.debug(FILE_PREFIX + " Deleting existing profile picture: {}", existingFilename);
            fileStorageService.delete(existingFilename);
        }

        String newFilename = fileStorageService.store(file);
        String newPictureUrl = IMAGES_BASE_PATH + newFilename;
        user.setProfilePictureUrl(newPictureUrl);

        User updatedUser = userRepository.save(user);
        log.info(FILE_UPLOAD_SUCCESS, newPictureUrl, userEmail);

        broadcastUserUpdateToSharedBoards(userEmail);
        return mapUserToUserProfileDTO(updatedUser);
    }

    @Transactional
    public UserProfileDTO deleteProfilePicture(String userEmail) {
        log.info(FILE_PREFIX + " Deleting profile picture for user: {}", userEmail);

        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });

        if (StringUtils.hasText(user.getProfilePictureUrl())) {
            String existingFilename =
                    user.getProfilePictureUrl().substring(IMAGES_BASE_PATH.length());
            fileStorageService.delete(existingFilename);
            user.setProfilePictureUrl(null);
            userRepository.save(user);
            log.info(FILE_DELETE_SUCCESS, existingFilename, userEmail);
        } else {
            log.debug(FILE_PREFIX + " No profile picture to delete for user: {}", userEmail);
        }

        broadcastUserUpdateToSharedBoards(userEmail);
        return mapUserToUserProfileDTO(user);
    }

    @Transactional
    public UserProfileDTO updateUserPreferences(String userEmail, UserPreferencesDTO dto) {
        log.info(DATA_PREFIX + " Updating preferences for user: {}", userEmail);

        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });

        user.setChatBackgroundSetting(dto.getChatBackgroundSetting());

        User updatedUser = userRepository.save(user);
        log.info(USER_PREFERENCES_UPDATED, userEmail);
        return mapUserToUserProfileDTO(updatedUser);
    }

    private UserProfileDTO mapUserToUserProfileDTO(User user) {
        return UserProfileDTO.builder()
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .gender(user.getGender())
                .phoneNumber(user.getPhoneNumber())
                .dateOfBirth(user.getDateOfBirth())
                .profilePictureUrl(user.getProfilePictureUrl())
                .chatBackgroundSetting(user.getChatBackgroundSetting())
                .build();
    }

    private void broadcastUserUpdateToSharedBoards(String userEmail) {
        log.debug(WEBSOCKET_PREFIX + " Broadcasting user update for: {}", userEmail);

        List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
        List<Long> boardIds = memberships.stream().map(GroupMember::getBoardGroupId).toList();

        if (!boardIds.isEmpty()) {
            log.debug(WEBSOCKET_PREFIX + " Broadcasting to {} boards for user: {}", boardIds.size(),
                    userEmail);
            notificationService.broadcastBoardUpdatesToMultipleBoards(boardIds,
                    BoardUpdateDTO.UpdateType.MEMBERS_UPDATED, userEmail);
        }
    }
}
