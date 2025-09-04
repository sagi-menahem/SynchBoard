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

@Slf4j
@RestController
@RequestMapping(API_USER_BASE_PATH)
@RequiredArgsConstructor
public class UserController {

        private final UserService userService;
        private final AuthService authService;
        private final UserAccountService userAccountService;

        @GetMapping(API_USER_EXISTS)
        public ResponseEntity<Boolean> checkUserExists(@PathVariable("email") String email) {
                log.debug("Checking if user exists: {}", email);
                boolean exists = userService.userExists(email);
                return ResponseEntity.ok(exists);
        }

        @GetMapping(API_USER_PROFILE)
        public ResponseEntity<UserProfileDTO> getCurrentUserProfile(Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(API_REQUEST_RECEIVED, "GET", API_USER_BASE_PATH + API_USER_PROFILE,
                                userEmail);

                UserProfileDTO userProfile = userService.getUserProfile(userEmail);
                log.info(USER_PROFILE_FETCHED, userEmail);
                return ResponseEntity.ok(userProfile);
        }

        @PutMapping(API_USER_PROFILE)
        public ResponseEntity<UserProfileDTO> updateUserProfile(Authentication authentication,
                        @Valid @RequestBody UpdateUserProfileRequest updateUserProfileRequest) {
                String userEmail = authentication.getName();
                log.info(API_REQUEST_RECEIVED, "PUT", API_USER_BASE_PATH + API_USER_PROFILE,
                                userEmail);

                UserProfileDTO updatedUser =
                                userService.updateUserProfile(userEmail, updateUserProfileRequest);
                log.info(USER_PROFILE_UPDATED, userEmail, "firstName, lastName, bio");
                return ResponseEntity.ok(updatedUser);
        }

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

        @PostMapping(API_USER_PROFILE_PICTURE)
        public ResponseEntity<UserProfileDTO> uploadProfilePicture(Authentication authentication,
                        @RequestParam(REQUEST_PARAM_FILE) MultipartFile file) {
                String userEmail = authentication.getName();
                log.info(FILE_UPLOAD_STARTED, file.getOriginalFilename(), userEmail,
                                file.getSize());

                UserProfileDTO updatedUser = userService.updateProfilePicture(userEmail, file);
                log.info(FILE_UPLOAD_SUCCESS, "profile picture", userEmail);
                return ResponseEntity.ok(updatedUser);
        }

        @DeleteMapping(API_USER_PROFILE_PICTURE)
        public ResponseEntity<UserProfileDTO> deleteProfilePicture(Authentication authentication) {
                String userEmail = authentication.getName();
                log.info(FILE_PREFIX + " Profile picture deletion requested by user: {}",
                                userEmail);

                UserProfileDTO updatedUser = userService.deleteProfilePicture(userEmail);
                log.info(FILE_DELETE_SUCCESS, "profile picture", userEmail);
                return ResponseEntity.ok(updatedUser);
        }

        @DeleteMapping(API_USER_ACCOUNT)
        public ResponseEntity<?> deleteAccount(Authentication authentication) {
                String userEmail = authentication.getName();
                log.warn(CRITICAL_PREFIX + " Account deletion requested by user: {}", userEmail);

                userAccountService.deleteAccount(userEmail);
                log.warn(USER_ACCOUNT_DELETED, userEmail);
                return ResponseEntity.ok().build();
        }

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

        @GetMapping(API_USER_CANVAS_PREFERENCES)
        public ResponseEntity<CanvasPreferencesDTO> getCanvasPreferences(
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(API_REQUEST_RECEIVED, "GET",
                                API_USER_BASE_PATH + API_USER_CANVAS_PREFERENCES, userEmail);

                CanvasPreferencesDTO canvasPreferences =
                                userService.getCanvasPreferences(userEmail);
                log.debug(USER_PREFERENCES_FETCHED, userEmail);
                return ResponseEntity.ok(canvasPreferences);
        }

        @PutMapping(API_USER_CANVAS_PREFERENCES)
        public ResponseEntity<CanvasPreferencesDTO> updateCanvasPreferences(
                        Authentication authentication,
                        @Valid @RequestBody CanvasPreferencesDTO canvasPreferencesDTO) {
                String userEmail = authentication.getName();
                log.debug(API_REQUEST_RECEIVED, "PUT",
                                API_USER_BASE_PATH + API_USER_CANVAS_PREFERENCES, userEmail);

                CanvasPreferencesDTO updatedPreferences = userService
                                .updateCanvasPreferences(userEmail, canvasPreferencesDTO);
                log.info(USER_PREFERENCES_UPDATED, userEmail);
                return ResponseEntity.ok(updatedPreferences);
        }

        @GetMapping(API_USER_TOOL_PREFERENCES)
        public ResponseEntity<ToolPreferencesDTO> getToolPreferences(
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(API_REQUEST_RECEIVED, "GET",
                                API_USER_BASE_PATH + API_USER_TOOL_PREFERENCES, userEmail);

                ToolPreferencesDTO toolPreferences = userService.getToolPreferences(userEmail);
                log.debug(USER_PREFERENCES_FETCHED, userEmail);
                return ResponseEntity.ok(toolPreferences);
        }

        @PutMapping(API_USER_TOOL_PREFERENCES)
        public ResponseEntity<ToolPreferencesDTO> updateToolPreferences(
                        Authentication authentication,
                        @Valid @RequestBody ToolPreferencesDTO toolPreferencesDTO) {
                String userEmail = authentication.getName();
                log.debug(API_REQUEST_RECEIVED, "PUT",
                                API_USER_BASE_PATH + API_USER_TOOL_PREFERENCES, userEmail);

                ToolPreferencesDTO updatedPreferences =
                                userService.updateToolPreferences(userEmail, toolPreferencesDTO);
                log.info(USER_PREFERENCES_UPDATED, userEmail);
                return ResponseEntity.ok(updatedPreferences);
        }

        @GetMapping(API_USER_LANGUAGE_PREFERENCES)
        public ResponseEntity<LanguagePreferencesDTO> getLanguagePreferences(
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(API_REQUEST_RECEIVED, "GET",
                                API_USER_BASE_PATH + API_USER_LANGUAGE_PREFERENCES, userEmail);

                LanguagePreferencesDTO languagePreferences =
                                userService.getLanguagePreferences(userEmail);
                log.debug(USER_PREFERENCES_FETCHED, userEmail);
                return ResponseEntity.ok(languagePreferences);
        }

        @PutMapping(API_USER_LANGUAGE_PREFERENCES)
        public ResponseEntity<LanguagePreferencesDTO> updateLanguagePreferences(
                        Authentication authentication,
                        @Valid @RequestBody LanguagePreferencesDTO languagePreferencesDTO) {
                String userEmail = authentication.getName();
                log.debug(API_REQUEST_RECEIVED, "PUT",
                                API_USER_BASE_PATH + API_USER_LANGUAGE_PREFERENCES, userEmail);

                LanguagePreferencesDTO updatedPreferences = userService
                                .updateLanguagePreferences(userEmail, languagePreferencesDTO);
                log.info(USER_PREFERENCES_UPDATED, userEmail);
                return ResponseEntity.ok(updatedPreferences);
        }

        @GetMapping(API_USER_THEME_PREFERENCES)
        public ResponseEntity<ThemePreferencesDTO> getThemePreferences(
                        Authentication authentication) {
                String userEmail = authentication.getName();
                log.debug(API_REQUEST_RECEIVED, "GET",
                                API_USER_BASE_PATH + API_USER_THEME_PREFERENCES, userEmail);

                ThemePreferencesDTO themePreferences = userService.getThemePreferences(userEmail);
                log.debug(USER_PREFERENCES_FETCHED, userEmail);
                return ResponseEntity.ok(themePreferences);
        }

        @PutMapping(API_USER_THEME_PREFERENCES)
        public ResponseEntity<ThemePreferencesDTO> updateThemePreferences(
                        Authentication authentication,
                        @Valid @RequestBody ThemePreferencesDTO themePreferencesDTO) {
                String userEmail = authentication.getName();
                log.debug(API_REQUEST_RECEIVED, "PUT",
                                API_USER_BASE_PATH + API_USER_THEME_PREFERENCES, userEmail);

                ThemePreferencesDTO updatedPreferences =
                                userService.updateThemePreferences(userEmail, themePreferencesDTO);
                log.info(USER_PREFERENCES_UPDATED, userEmail);
                return ResponseEntity.ok(updatedPreferences);
        }
}
