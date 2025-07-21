// File: backend/src/main/java/com/synchboard/backend/controller/UserController.java
package com.synchboard.backend.controller;

import com.synchboard.backend.dto.user.ChangePasswordDTO;
import com.synchboard.backend.dto.user.UpdateUserProfileDTO;
import com.synchboard.backend.dto.user.UserPreferencesDTO;
import com.synchboard.backend.dto.user.UserProfileDTO;
import com.synchboard.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile(Authentication authentication) {
        String userEmail = authentication.getName();
        UserProfileDTO userProfile = userService.getUserProfile(userEmail);
        return ResponseEntity.ok(userProfile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserProfileDTO updateUserProfileDTO) {
        String userEmail = authentication.getName();
        UserProfileDTO updatedUser = userService.updateUserProfile(userEmail, updateUserProfileDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordDTO changePasswordDTO) {
        String userEmail = authentication.getName();
        userService.changePassword(userEmail, changePasswordDTO.getCurrentPassword(),
                changePasswordDTO.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<UserProfileDTO> uploadProfilePicture(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String userEmail = authentication.getName();
        UserProfileDTO updatedUser = userService.updateProfilePicture(userEmail, file);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/profile-picture")
    public ResponseEntity<UserProfileDTO> deleteProfilePicture(Authentication authentication) {
        String userEmail = authentication.getName();
        UserProfileDTO updatedUser = userService.deleteProfilePicture(userEmail);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        String userEmail = authentication.getName();
        userService.deleteAccount(userEmail);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserProfileDTO> updateUserPreferences(
            Authentication authentication,
            @RequestBody UserPreferencesDTO userPreferencesDTO) {
        String userEmail = authentication.getName();
        UserProfileDTO updatedUser = userService.updateUserPreferences(userEmail, userPreferencesDTO);
        return ResponseEntity.ok(updatedUser);
    }
}