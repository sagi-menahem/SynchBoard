package io.github.sagimenahem.synchboard.service.user;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;

import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.user.*;
import io.github.sagimenahem.synchboard.dto.websocket.BoardUpdateDTO;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import io.github.sagimenahem.synchboard.service.board.BoardNotificationService;
import io.github.sagimenahem.synchboard.service.storage.FileStorageService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service layer for user profile management and preference operations. Handles user profile
 * updates, preference management, file uploads, and provides user existence checking with
 * comprehensive logging.
 * 
 * @author Sagi Menahem
 */
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
                .preferredLanguage(user.getPreferredLanguage()).build();
    }

    private void broadcastUserUpdateToSharedBoards(String userEmail) {
        log.debug(WEBSOCKET_PREFIX + " Broadcasting user update for: {}", userEmail);

        // Find all boards where this user is a member to notify about profile changes
        List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
        List<Long> boardIds = memberships.stream().map(GroupMember::getBoardGroupId).toList();

        if (!boardIds.isEmpty()) {
            // Broadcast user profile changes to all shared boards for real-time UI updates
            // This ensures member avatars, names, etc. are updated immediately across all boards
            log.debug(WEBSOCKET_PREFIX + " Broadcasting to {} boards for user: {}", boardIds.size(),
                    userEmail);
            notificationService.broadcastBoardUpdatesToMultipleBoards(boardIds,
                    BoardUpdateDTO.UpdateType.MEMBERS_UPDATED, userEmail);
        }
    }

    @Transactional(readOnly = true)
    public CanvasPreferencesDTO getCanvasPreferences(String userEmail) {
        return getPreferences(userEmail, "canvas",
                (user) -> CanvasPreferencesDTO.builder()
                        .canvasChatSplitRatio(user.getCanvasChatSplitRatio())
                        .isChatOpen(user.getIsChatOpen()).build());
    }

    @Transactional
    public CanvasPreferencesDTO updateCanvasPreferences(String userEmail,
            CanvasPreferencesDTO preferences) {
        return updatePreferences(userEmail, "canvas", preferences, (user, prefs) -> {
            if (prefs.getCanvasChatSplitRatio() != null) {
                user.setCanvasChatSplitRatio(prefs.getCanvasChatSplitRatio());
            }
            if (prefs.getIsChatOpen() != null) {
                user.setIsChatOpen(prefs.getIsChatOpen());
            }
        }, (user) -> CanvasPreferencesDTO.builder()
                .canvasChatSplitRatio(user.getCanvasChatSplitRatio())
                .isChatOpen(user.getIsChatOpen()).build());
    }

    @Transactional(readOnly = true)
    public ToolPreferencesDTO getToolPreferences(String userEmail) {
        return getPreferences(userEmail, "tool",
                (user) -> ToolPreferencesDTO.builder().defaultTool(user.getDefaultTool())
                        .defaultStrokeColor(user.getDefaultStrokeColor())
                        .defaultStrokeWidth(user.getDefaultStrokeWidth()).build());
    }

    @Transactional
    public ToolPreferencesDTO updateToolPreferences(String userEmail,
            ToolPreferencesDTO preferences) {
        return updatePreferences(userEmail, "tool", preferences, (user, prefs) -> {
            if (prefs.getDefaultTool() != null) {
                user.setDefaultTool(prefs.getDefaultTool());
            }
            if (prefs.getDefaultStrokeColor() != null) {
                user.setDefaultStrokeColor(prefs.getDefaultStrokeColor());
            }
            if (prefs.getDefaultStrokeWidth() != null) {
                user.setDefaultStrokeWidth(prefs.getDefaultStrokeWidth());
            }
        }, (user) -> ToolPreferencesDTO.builder().defaultTool(user.getDefaultTool())
                .defaultStrokeColor(user.getDefaultStrokeColor())
                .defaultStrokeWidth(user.getDefaultStrokeWidth()).build());
    }

    @Transactional(readOnly = true)
    public LanguagePreferencesDTO getLanguagePreferences(String userEmail) {
        return getPreferences(userEmail, "language", (user) -> LanguagePreferencesDTO.builder()
                .preferredLanguage(user.getPreferredLanguage()).build());
    }

    @Transactional
    public LanguagePreferencesDTO updateLanguagePreferences(String userEmail,
            LanguagePreferencesDTO preferences) {
        return updatePreferences(userEmail, "language", preferences, (user, prefs) -> {
            if (prefs.getPreferredLanguage() != null) {
                user.setPreferredLanguage(prefs.getPreferredLanguage());
            }
        }, (user) -> LanguagePreferencesDTO.builder().preferredLanguage(user.getPreferredLanguage())
                .build());
    }

    @Transactional(readOnly = true)
    public ThemePreferencesDTO getThemePreferences(String userEmail) {
        return getPreferences(userEmail, "theme",
                (user) -> ThemePreferencesDTO.builder().theme(user.getThemePreference()).build());
    }

    @Transactional
    public ThemePreferencesDTO updateThemePreferences(String userEmail,
            ThemePreferencesDTO preferences) {
        return updatePreferences(userEmail, "theme", preferences, (user, prefs) -> {
            if (prefs.getTheme() != null) {
                user.setThemePreference(prefs.getTheme());
            }
        }, (user) -> ThemePreferencesDTO.builder().theme(user.getThemePreference()).build());
    }

    private <T> T getPreferences(String userEmail, String preferenceType,
            PreferenceMapper<T> mapper) {
        log.debug("Fetching {} preferences for user: {}", preferenceType, userEmail);

        User user = findUserOrThrow(userEmail);
        // Use functional mapper to convert User entity to specific preference DTO
        // This pattern eliminates code duplication across different preference types
        return mapper.map(user);
    }

    private <T> T updatePreferences(String userEmail, String preferenceType, T preferences,
            PreferenceUpdater<T> updater, PreferenceMapper<T> mapper) {
        log.debug("Updating {} preferences for user: {}", preferenceType, userEmail);

        User user = findUserOrThrow(userEmail);
        // Use functional updater to apply changes - allows null-safe partial updates
        // This pattern ensures consistent validation and persistence across preference types
        updater.update(user, preferences);
        userRepository.save(user);

        // Capitalize first letter for consistent logging format
        log.info("{} preferences updated for user: {}",
                preferenceType.substring(0, 1).toUpperCase() + preferenceType.substring(1),
                userEmail);

        // Return updated preferences using the same mapper for consistency
        return mapper.map(user);
    }

    private User findUserOrThrow(String userEmail) {
        return userRepository.findById(userEmail).orElseThrow(() -> {
            log.warn(USER_NOT_FOUND, userEmail);
            return new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail);
        });
    }

    @FunctionalInterface
    private interface PreferenceUpdater<T> {
        void update(User user, T preferences);
    }

    @FunctionalInterface
    private interface PreferenceMapper<T> {
        T map(User user);
    }
}
