package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.*;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.dto.user.*;
import io.github.sagimenahem.synchboard.service.auth.AuthService;
import io.github.sagimenahem.synchboard.service.user.UserAccountService;
import io.github.sagimenahem.synchboard.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for managing user account operations, profile settings, and preferences. Handles
 * user profile updates, password changes, file uploads, account deletion, and comprehensive user
 * preference management for themes, tools, canvas, and language settings.
 * 
 * @author Sagi Menahem
 */
@Slf4j
@RestController
@RequestMapping(API_USER_BASE_PATH)
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final UserAccountService userAccountService;

    /**
     * Checks if a user account exists for the given email address. Used for registration validation
     * and user lookup operations.
     * 
     * @param email the email address to check for existing account
     * @return ResponseEntity containing boolean indicating if user exists
     */
    @GetMapping(API_USER_EXISTS)
    public ResponseEntity<Boolean> checkUserExists(@PathVariable("email") String email) {
        log.debug("Checking if user exists: {}", email);
        boolean exists = userService.userExists(email);
        return ResponseEntity.ok(exists);
    }

    /**
     * Retrieves the complete profile information for the authenticated user. Returns comprehensive
     * user data including personal info and preferences.
     * 
     * @param authentication the authentication context containing user credentials
     * @return ResponseEntity containing complete user profile information
     */
    @GetMapping(API_USER_PROFILE)
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile(Authentication authentication) {
        String userEmail = authentication.getName();
        log.debug(API_REQUEST_RECEIVED, "GET", API_USER_BASE_PATH + API_USER_PROFILE, userEmail);

        UserProfileDTO userProfile = userService.getUserProfile(userEmail);
        log.info(USER_PROFILE_FETCHED, userEmail);
        return ResponseEntity.ok(userProfile);
    }

    /**
     * Updates the authenticated user's profile information. Modifies personal details such as name,
     * bio, and other profile attributes.
     * 
     * @param authentication the authentication context containing user credentials
     * @param updateUserProfileRequest the updated profile information
     * @return ResponseEntity containing updated user profile data
     */
    @PutMapping(API_USER_PROFILE)
    public ResponseEntity<UserProfileDTO> updateUserProfile(Authentication authentication,
            @Valid @RequestBody UpdateUserProfileRequest updateUserProfileRequest) {
        String userEmail = authentication.getName();
        log.info(API_REQUEST_RECEIVED, "PUT", API_USER_BASE_PATH + API_USER_PROFILE, userEmail);

        UserProfileDTO updatedUser =
                userService.updateUserProfile(userEmail, updateUserProfileRequest);
        log.info(USER_PROFILE_UPDATED, userEmail, "firstName, lastName, bio");
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Changes the authenticated user's password. Validates current password before setting new
     * password for security.
     * 
     * @param authentication the authentication context containing user credentials
     * @param changePasswordRequest the password change details including current and new passwords
     * @return ResponseEntity with no content on successful password change
     */
    @PutMapping(API_USER_PASSWORD)
    public ResponseEntity<?> changePassword(Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        String userEmail = authentication.getName();
        log.info(SECURITY_PREFIX + " Password change attempt for user: {}", userEmail);

        authService.changePassword(userEmail, changePasswordRequest.getCurrentPassword(),
                changePasswordRequest.getNewPassword());
        log.info(AUTH_PASSWORD_CHANGED, userEmail);
        return ResponseEntity.ok().build();
    }

    /**
     * Uploads and sets a new profile picture for the authenticated user. Handles image file upload,
     * validation, and storage.
     * 
     * @param authentication the authentication context containing user credentials
     * @param file the image file to upload as new profile picture
     * @return ResponseEntity containing updated user profile with new picture
     */
    @PostMapping(API_USER_PROFILE_PICTURE)
    public ResponseEntity<UserProfileDTO> uploadProfilePicture(Authentication authentication,
            @RequestParam(REQUEST_PARAM_FILE) MultipartFile file) {
        String userEmail = authentication.getName();
        log.info(FILE_UPLOAD_STARTED, file.getOriginalFilename(), userEmail, file.getSize());

        UserProfileDTO updatedUser = userService.updateProfilePicture(userEmail, file);
        log.info(FILE_UPLOAD_SUCCESS, "profile picture", userEmail);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Removes the current profile picture for the authenticated user. Deletes the associated image
     * file from storage and updates the user profile to remove the picture reference.
     * 
     * @param authentication the authentication context containing user credentials
     * @return ResponseEntity containing updated user profile without profile picture
     */
    @DeleteMapping(API_USER_PROFILE_PICTURE)
    public ResponseEntity<UserProfileDTO> deleteProfilePicture(Authentication authentication) {
        String userEmail = authentication.getName();
        log.info(FILE_PREFIX + " Profile picture deletion requested by user: {}", userEmail);

        UserProfileDTO updatedUser = userService.deleteProfilePicture(userEmail);
        log.info(FILE_DELETE_SUCCESS, "profile picture", userEmail);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Permanently deletes the authenticated user's account and all associated data. This is a
     * critical operation that removes user from all boards and deletes personal data.
     * 
     * @param authentication the authentication context containing user credentials
     * @return ResponseEntity with no content on successful account deletion
     */
    @DeleteMapping(API_USER_ACCOUNT)
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        String userEmail = authentication.getName();
        log.warn(CRITICAL_PREFIX + " Account deletion requested by user: {}", userEmail);

        userAccountService.deleteAccount(userEmail);
        log.warn(USER_ACCOUNT_DELETED, userEmail);
        return ResponseEntity.ok().build();
    }

    /**
     * Updates comprehensive user preferences including theme, language, canvas, and tool settings.
     * Allows bulk update of multiple preference categories in a single request.
     * 
     * @param authentication the authentication context containing user credentials
     * @param userPreferencesDTO the updated preferences including theme, language, and tool settings
     * @return ResponseEntity containing updated user profile with new preferences applied
     */
    @PutMapping(API_USER_PREFERENCES)
    public ResponseEntity<UserProfileDTO> updateUserPreferences(Authentication authentication,
            @RequestBody UserPreferencesDTO userPreferencesDTO) {
        String userEmail = authentication.getName();
        log.debug(API_REQUEST_RECEIVED, "PUT", API_USER_BASE_PATH + API_USER_PREFERENCES,
                userEmail);

        UserProfileDTO updatedUser =
                userService.updateUserPreferences(userEmail, userPreferencesDTO);
        log.info(USER_PREFERENCES_UPDATED, userEmail);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Retrieves canvas-specific preferences for the authenticated user. Returns drawing tool
     * defaults, canvas layout settings, and visual preferences.
     * 
     * @param authentication the authentication context containing user credentials
     * @return ResponseEntity containing canvas preferences including tool defaults and layout settings
     */
    @GetMapping(API_USER_CANVAS_PREFERENCES)
    public ResponseEntity<CanvasPreferencesDTO> getCanvasPreferences(
            Authentication authentication) {
        String userEmail = authentication.getName();
        log.debug(API_REQUEST_RECEIVED, "GET", API_USER_BASE_PATH + API_USER_CANVAS_PREFERENCES,
                userEmail);

        CanvasPreferencesDTO canvasPreferences = userService.getCanvasPreferences(userEmail);
        log.debug(USER_PREFERENCES_FETCHED, userEmail);
        return ResponseEntity.ok(canvasPreferences);
    }

    /**
     * Updates canvas-specific preferences for the authenticated user. Modifies drawing tool
     * defaults, canvas layout settings, and visual display preferences.
     * 
     * @param authentication the authentication context containing user credentials
     * @param canvasPreferencesDTO the updated canvas preferences including tool settings and layout
     * @return ResponseEntity containing updated canvas preferences
     */
    @PutMapping(API_USER_CANVAS_PREFERENCES)
    public ResponseEntity<CanvasPreferencesDTO> updateCanvasPreferences(
            Authentication authentication,
            @Valid @RequestBody CanvasPreferencesDTO canvasPreferencesDTO) {
        String userEmail = authentication.getName();
        log.debug(API_REQUEST_RECEIVED, "PUT", API_USER_BASE_PATH + API_USER_CANVAS_PREFERENCES,
                userEmail);

        CanvasPreferencesDTO updatedPreferences =
                userService.updateCanvasPreferences(userEmail, canvasPreferencesDTO);
        log.info(USER_PREFERENCES_UPDATED, userEmail);
        return ResponseEntity.ok(updatedPreferences);
    }

    /**
     * Retrieves drawing tool preferences for the authenticated user. Returns default tool selection,
     * brush settings, stroke properties, and other tool-specific configurations.
     * 
     * @param authentication the authentication context containing user credentials
     * @return ResponseEntity containing tool preferences including default selections and settings
     */
    @GetMapping(API_USER_TOOL_PREFERENCES)
    public ResponseEntity<ToolPreferencesDTO> getToolPreferences(Authentication authentication) {
        String userEmail = authentication.getName();
        log.debug(API_REQUEST_RECEIVED, "GET", API_USER_BASE_PATH + API_USER_TOOL_PREFERENCES,
                userEmail);

        ToolPreferencesDTO toolPreferences = userService.getToolPreferences(userEmail);
        log.debug(USER_PREFERENCES_FETCHED, userEmail);
        return ResponseEntity.ok(toolPreferences);
    }

    /**
     * Updates drawing tool preferences for the authenticated user. Modifies default tool selection,
     * brush settings, stroke properties, and other tool-specific configurations.
     * 
     * @param authentication the authentication context containing user credentials
     * @param toolPreferencesDTO the updated tool preferences including default selections and settings
     * @return ResponseEntity containing updated tool preferences
     */
    @PutMapping(API_USER_TOOL_PREFERENCES)
    public ResponseEntity<ToolPreferencesDTO> updateToolPreferences(Authentication authentication,
            @Valid @RequestBody ToolPreferencesDTO toolPreferencesDTO) {
        String userEmail = authentication.getName();
        log.debug(API_REQUEST_RECEIVED, "PUT", API_USER_BASE_PATH + API_USER_TOOL_PREFERENCES,
                userEmail);

        ToolPreferencesDTO updatedPreferences =
                userService.updateToolPreferences(userEmail, toolPreferencesDTO);
        log.info(USER_PREFERENCES_UPDATED, userEmail);
        return ResponseEntity.ok(updatedPreferences);
    }

    /**
     * Retrieves language and localization preferences for the authenticated user. Returns preferred
     * language settings and regional formatting options.
     * 
     * @param authentication the authentication context containing user credentials
     * @return ResponseEntity containing language preferences including locale and formatting settings
     */
    @GetMapping(API_USER_LANGUAGE_PREFERENCES)
    public ResponseEntity<LanguagePreferencesDTO> getLanguagePreferences(
            Authentication authentication) {
        String userEmail = authentication.getName();
        log.debug(API_REQUEST_RECEIVED, "GET", API_USER_BASE_PATH + API_USER_LANGUAGE_PREFERENCES,
                userEmail);

        LanguagePreferencesDTO languagePreferences = userService.getLanguagePreferences(userEmail);
        log.debug(USER_PREFERENCES_FETCHED, userEmail);
        return ResponseEntity.ok(languagePreferences);
    }

    /**
     * Updates language and localization preferences for the authenticated user. Modifies preferred
     * language settings and regional formatting options for the application interface.
     * 
     * @param authentication the authentication context containing user credentials
     * @param languagePreferencesDTO the updated language preferences including locale settings
     * @return ResponseEntity containing updated language preferences
     */
    @PutMapping(API_USER_LANGUAGE_PREFERENCES)
    public ResponseEntity<LanguagePreferencesDTO> updateLanguagePreferences(
            Authentication authentication,
            @Valid @RequestBody LanguagePreferencesDTO languagePreferencesDTO) {
        String userEmail = authentication.getName();
        log.debug(API_REQUEST_RECEIVED, "PUT", API_USER_BASE_PATH + API_USER_LANGUAGE_PREFERENCES,
                userEmail);

        LanguagePreferencesDTO updatedPreferences =
                userService.updateLanguagePreferences(userEmail, languagePreferencesDTO);
        log.info(USER_PREFERENCES_UPDATED, userEmail);
        return ResponseEntity.ok(updatedPreferences);
    }

    /**
     * Retrieves theme and visual appearance preferences for the authenticated user. Returns color
     * scheme settings, dark/light mode preferences, and other visual customizations.
     * 
     * @param authentication the authentication context containing user credentials
     * @return ResponseEntity containing theme preferences including color schemes and visual settings
     */
    @GetMapping(API_USER_THEME_PREFERENCES)
    public ResponseEntity<ThemePreferencesDTO> getThemePreferences(Authentication authentication) {
        String userEmail = authentication.getName();
        log.debug(API_REQUEST_RECEIVED, "GET", API_USER_BASE_PATH + API_USER_THEME_PREFERENCES,
                userEmail);

        ThemePreferencesDTO themePreferences = userService.getThemePreferences(userEmail);
        log.debug(USER_PREFERENCES_FETCHED, userEmail);
        return ResponseEntity.ok(themePreferences);
    }

    /**
     * Updates theme and visual appearance preferences for the authenticated user. Modifies color
     * scheme settings, dark/light mode preferences, and other visual customizations.
     * 
     * @param authentication the authentication context containing user credentials
     * @param themePreferencesDTO the updated theme preferences including color schemes and visual settings
     * @return ResponseEntity containing updated theme preferences
     */
    @PutMapping(API_USER_THEME_PREFERENCES)
    public ResponseEntity<ThemePreferencesDTO> updateThemePreferences(Authentication authentication,
            @Valid @RequestBody ThemePreferencesDTO themePreferencesDTO) {
        String userEmail = authentication.getName();
        log.debug(API_REQUEST_RECEIVED, "PUT", API_USER_BASE_PATH + API_USER_THEME_PREFERENCES,
                userEmail);

        ThemePreferencesDTO updatedPreferences =
                userService.updateThemePreferences(userEmail, themePreferencesDTO);
        log.info(USER_PREFERENCES_UPDATED, userEmail);
        return ResponseEntity.ok(updatedPreferences);
    }
}
