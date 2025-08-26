package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.user.CanvasPreferencesDTO;
import io.github.sagimenahem.synchboard.dto.user.LanguagePreferencesDTO;
import io.github.sagimenahem.synchboard.dto.user.ToolPreferencesDTO;
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
    public boolean userExists(String userEmail) {
        log.debug("Checking if user exists: {}", userEmail);
        return userRepository.existsById(userEmail);
    }

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
        log.info(USER_PROFILE_UPDATED, userEmail,
                "firstName, lastName, gender, phoneNumber, dateOfBirth");

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
            String existingFilename = extractFilenameFromPictureUrl(user.getProfilePictureUrl());
            if (existingFilename != null && !existingFilename.isBlank()) {
                log.debug(FILE_PREFIX + " Deleting existing profile picture: {}", existingFilename);
                try {
                    fileStorageService.delete(existingFilename);
                } catch (Exception e) {
                    log.warn("Failed to delete existing profile picture file: {} - {}",
                            existingFilename, e.getMessage());
                }
            }
        }

        String newPictureUrl = fileStorageService.store(file);
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
            String existingFilename = extractFilenameFromPictureUrl(user.getProfilePictureUrl());
            if (existingFilename != null && !existingFilename.isBlank()) {
                try {
                    fileStorageService.delete(existingFilename);
                    log.info(FILE_DELETE_SUCCESS, existingFilename, userEmail);
                } catch (Exception e) {
                    log.warn("Failed to delete profile picture file: {} - {}", existingFilename,
                            e.getMessage());
                }
            }
            user.setProfilePictureUrl(null);
            userRepository.save(user);
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

        user.setBoardBackgroundSetting(dto.getBoardBackgroundSetting());

        User updatedUser = userRepository.save(user);
        log.info(USER_PREFERENCES_UPDATED, userEmail);
        return mapUserToUserProfileDTO(updatedUser);
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

    private UserProfileDTO mapUserToUserProfileDTO(User user) {
        return UserProfileDTO.builder().email(user.getEmail()).firstName(user.getFirstName())
                .lastName(user.getLastName()).gender(user.getGender())
                .phoneNumber(user.getPhoneNumber()).dateOfBirth(user.getDateOfBirth())
                .profilePictureUrl(user.getProfilePictureUrl())
                .boardBackgroundSetting(user.getBoardBackgroundSetting())
                .preferredLanguage(user.getPreferredLanguage())
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

    @Transactional(readOnly = true)
    public CanvasPreferencesDTO getCanvasPreferences(String userEmail) {
        log.debug("Fetching canvas preferences for user: {}", userEmail);
        
        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });
        
        return CanvasPreferencesDTO.builder()
                .canvasChatSplitRatio(user.getCanvasChatSplitRatio())
                .build();
    }

    @Transactional
    public CanvasPreferencesDTO updateCanvasPreferences(String userEmail, CanvasPreferencesDTO preferences) {
        log.debug("Updating canvas preferences for user: {}", userEmail);
        
        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });
        
        if (preferences.getCanvasChatSplitRatio() != null) {
            user.setCanvasChatSplitRatio(preferences.getCanvasChatSplitRatio());
        }
        
        userRepository.save(user);
        log.info("Canvas preferences updated for user: {}", userEmail);
        
        return CanvasPreferencesDTO.builder()
                .canvasChatSplitRatio(user.getCanvasChatSplitRatio())
                .build();
    }

    @Transactional(readOnly = true)
    public ToolPreferencesDTO getToolPreferences(String userEmail) {
        log.debug("Fetching tool preferences for user: {}", userEmail);
        
        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });
        
        return ToolPreferencesDTO.builder()
                .defaultTool(user.getDefaultTool())
                .defaultStrokeColor(user.getDefaultStrokeColor())
                .defaultStrokeWidth(user.getDefaultStrokeWidth())
                .build();
    }

    @Transactional
    public ToolPreferencesDTO updateToolPreferences(String userEmail, ToolPreferencesDTO preferences) {
        log.debug("Updating tool preferences for user: {}", userEmail);
        
        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });
        
        if (preferences.getDefaultTool() != null) {
            user.setDefaultTool(preferences.getDefaultTool());
        }
        if (preferences.getDefaultStrokeColor() != null) {
            user.setDefaultStrokeColor(preferences.getDefaultStrokeColor());
        }
        if (preferences.getDefaultStrokeWidth() != null) {
            user.setDefaultStrokeWidth(preferences.getDefaultStrokeWidth());
        }
        
        userRepository.save(user);
        log.info("Tool preferences updated for user: {}", userEmail);
        
        return ToolPreferencesDTO.builder()
                .defaultTool(user.getDefaultTool())
                .defaultStrokeColor(user.getDefaultStrokeColor())
                .defaultStrokeWidth(user.getDefaultStrokeWidth())
                .build();
    }

    @Transactional(readOnly = true)
    public LanguagePreferencesDTO getLanguagePreferences(String userEmail) {
        log.debug("Fetching language preferences for user: {}", userEmail);
        
        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });
        
        return LanguagePreferencesDTO.builder()
                .preferredLanguage(user.getPreferredLanguage())
                .build();
    }

    @Transactional
    public LanguagePreferencesDTO updateLanguagePreferences(String userEmail, LanguagePreferencesDTO preferences) {
        log.debug("Updating language preferences for user: {}", userEmail);
        
        User user = userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });
        
        if (preferences.getPreferredLanguage() != null) {
            user.setPreferredLanguage(preferences.getPreferredLanguage());
        }
        
        userRepository.save(user);
        log.info("Language preferences updated for user: {}", userEmail);
        
        return LanguagePreferencesDTO.builder()
                .preferredLanguage(user.getPreferredLanguage())
                .build();
    }
}
