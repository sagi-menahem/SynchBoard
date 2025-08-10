package io.github.sagimenahem.synchboard.controller;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.dto.user.ChangePasswordDTO;
import io.github.sagimenahem.synchboard.dto.user.UpdateUserProfileDTO;
import io.github.sagimenahem.synchboard.dto.user.UserPreferencesDTO;
import io.github.sagimenahem.synchboard.dto.user.UserProfileDTO;
import io.github.sagimenahem.synchboard.service.AuthService;
import io.github.sagimenahem.synchboard.service.UserAccountService;
import io.github.sagimenahem.synchboard.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(API_USER_BASE_PATH)
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final UserAccountService userAccountService;

    @GetMapping(API_USER_PROFILE)
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile(Authentication authentication) {
        String userEmail = authentication.getName();
        UserProfileDTO userProfile = userService.getUserProfile(userEmail);
        return ResponseEntity.ok(userProfile);
    }

    @PutMapping(API_USER_PROFILE)
    public ResponseEntity<UserProfileDTO> updateUserProfile(Authentication authentication,
            @Valid @RequestBody UpdateUserProfileDTO updateUserProfileDTO) {
        String userEmail = authentication.getName();
        UserProfileDTO updatedUser = userService.updateUserProfile(userEmail, updateUserProfileDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping(API_USER_PASSWORD)
    public ResponseEntity<?> changePassword(Authentication authentication,
            @Valid @RequestBody ChangePasswordDTO changePasswordDTO) {
        String userEmail = authentication.getName();
        authService.changePassword(userEmail, changePasswordDTO.getCurrentPassword(),
                changePasswordDTO.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping(API_USER_PROFILE_PICTURE)
    public ResponseEntity<UserProfileDTO> uploadProfilePicture(Authentication authentication,
            @RequestParam(REQUEST_PARAM_FILE) MultipartFile file) {
        String userEmail = authentication.getName();
        UserProfileDTO updatedUser = userService.updateProfilePicture(userEmail, file);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping(API_USER_PROFILE_PICTURE)
    public ResponseEntity<UserProfileDTO> deleteProfilePicture(Authentication authentication) {
        String userEmail = authentication.getName();
        UserProfileDTO updatedUser = userService.deleteProfilePicture(userEmail);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping(API_USER_ACCOUNT)
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        String userEmail = authentication.getName();
        userAccountService.deleteAccount(userEmail);
        return ResponseEntity.ok().build();
    }

    @PutMapping(API_USER_PREFERENCES)
    public ResponseEntity<UserProfileDTO> updateUserPreferences(Authentication authentication,
            @RequestBody UserPreferencesDTO userPreferencesDTO) {
        String userEmail = authentication.getName();
        UserProfileDTO updatedUser =
                userService.updateUserPreferences(userEmail, userPreferencesDTO);
        return ResponseEntity.ok(updatedUser);
    }
}
