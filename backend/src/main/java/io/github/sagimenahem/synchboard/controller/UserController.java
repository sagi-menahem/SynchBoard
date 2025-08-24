package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.*;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.dto.user.ChangePasswordRequest;
import io.github.sagimenahem.synchboard.dto.user.UpdateUserProfileRequest;
import io.github.sagimenahem.synchboard.dto.user.UserPreferencesDTO;
import io.github.sagimenahem.synchboard.dto.user.UserProfileDTO;
import io.github.sagimenahem.synchboard.service.AuthService;
import io.github.sagimenahem.synchboard.service.UserAccountService;
import io.github.sagimenahem.synchboard.service.UserService;
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
        log.debug(API_REQUEST_RECEIVED, "GET", API_USER_BASE_PATH + API_USER_PROFILE, userEmail);

        UserProfileDTO userProfile = userService.getUserProfile(userEmail);
        log.info(USER_PROFILE_FETCHED, userEmail);
        return ResponseEntity.ok(userProfile);
    }

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
        log.info(FILE_UPLOAD_STARTED, file.getOriginalFilename(), userEmail, file.getSize());

        UserProfileDTO updatedUser = userService.updateProfilePicture(userEmail, file);
        log.info(FILE_UPLOAD_SUCCESS, "profile picture", userEmail);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping(API_USER_PROFILE_PICTURE)
    public ResponseEntity<UserProfileDTO> deleteProfilePicture(Authentication authentication) {
        String userEmail = authentication.getName();
        log.info(FILE_PREFIX + " Profile picture deletion requested by user: {}", userEmail);

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
}
