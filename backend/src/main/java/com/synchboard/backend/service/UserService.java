// File: backend/src/main/java/com/synchboard/backend/service/UserService.java
package com.synchboard.backend.service;

import com.synchboard.backend.dto.auth.AuthResponse;
import com.synchboard.backend.dto.auth.LoginRequest;
import com.synchboard.backend.dto.auth.RegisterRequest;
import com.synchboard.backend.dto.user.UpdateUserProfileDTO;
import com.synchboard.backend.dto.user.UserProfileDTO;
import com.synchboard.backend.dto.user.UserPreferencesDTO;
import com.synchboard.backend.entity.GroupMember;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.exception.InvalidPasswordException;
import com.synchboard.backend.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.synchboard.backend.dto.websocket.BoardUpdateDTO;

import java.util.List;
import java.util.stream.Collectors;

import static com.synchboard.backend.config.ApplicationConstants.*;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final FileStorageService fileStorageService;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupBoardService groupBoardService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final ActionHistoryRepository actionHistoryRepository;
    private final BoardObjectRepository boardObjectRepository;
    private final GroupBoardRepository groupBoardRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtService jwtService, AuthenticationManager authenticationManager,
            FileStorageService fileStorageService, GroupMemberRepository groupMemberRepository,
            @Lazy GroupBoardService groupBoardService, SimpMessageSendingOperations messagingTemplate,
            ActionHistoryRepository actionHistoryRepository, BoardObjectRepository boardObjectRepository,
            GroupBoardRepository groupBoardRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.fileStorageService = fileStorageService;
        this.groupMemberRepository = groupMemberRepository;
        this.groupBoardService = groupBoardService;
        this.messagingTemplate = messagingTemplate;
        this.actionHistoryRepository = actionHistoryRepository;
        this.boardObjectRepository = boardObjectRepository;
        this.groupBoardRepository = groupBoardRepository;
    }

    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsById(request.getEmail())) {
            throw new RuntimeException(ERROR_EMAIL_IN_USE);
        }

        User newUser = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .build();

        userRepository.save(newUser);

        String jwtToken = jwtService.generateToken(newUser);
        return new AuthResponse(jwtToken);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = userRepository.findById(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException(ERROR_USER_NOT_FOUND_AFTER_AUTH));

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(String userEmail) {
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + userEmail));

        return mapUserToUserProfileDTO(user);
    }

    @Transactional
    public UserProfileDTO updateUserProfile(String userEmail, UpdateUserProfileDTO dto) {
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + userEmail));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());

        User updatedUser = userRepository.save(user);

        broadcastUserUpdateToSharedBoards(userEmail);
        return mapUserToUserProfileDTO(updatedUser);
    }

    @Transactional
    public void changePassword(String userEmail, String currentPassword, String newPassword) {
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + userEmail));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new InvalidPasswordException(ERROR_INCORRECT_CURRENT_PASSWORD);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public UserProfileDTO updateProfilePicture(String userEmail, MultipartFile file) {
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + userEmail));

        if (StringUtils.hasText(user.getProfilePictureUrl())) {
            String existingFilename = user.getProfilePictureUrl().substring("/images/".length());
            fileStorageService.delete(existingFilename);
        }

        String newFilename = fileStorageService.store(file);
        String newPictureUrl = "/images/" + newFilename;
        user.setProfilePictureUrl(newPictureUrl);

        User updatedUser = userRepository.save(user);

        broadcastUserUpdateToSharedBoards(userEmail);
        return mapUserToUserProfileDTO(updatedUser);
    }

    @Transactional
    public UserProfileDTO deleteProfilePicture(String userEmail) {
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + userEmail));

        if (StringUtils.hasText(user.getProfilePictureUrl())) {
            String existingFilename = user.getProfilePictureUrl().substring("/images/".length());
            fileStorageService.delete(existingFilename);
            user.setProfilePictureUrl(null);
            userRepository.save(user);
        }

        broadcastUserUpdateToSharedBoards(userEmail);
        return mapUserToUserProfileDTO(user);
    }

    @Transactional
    public void deleteAccount(String userEmail) {
        // Step 0: Find the user
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + userEmail));

        boardObjectRepository.nullifyCreatedByUser(userEmail);
        boardObjectRepository.nullifyLastEditedByUser(userEmail);

        groupBoardRepository.nullifyCreatedByUser(userEmail);

        actionHistoryRepository.deleteAllByUser_Email(userEmail);

        List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
        List<Long> boardIds = memberships.stream()
                .map(GroupMember::getBoardGroupId)
                .collect(Collectors.toList());
        boardIds.forEach(boardId -> groupBoardService.leaveBoard(boardId, userEmail));

        if (StringUtils.hasText(user.getProfilePictureUrl())) {
            String existingFilename = user.getProfilePictureUrl().substring("/images/".length());
            fileStorageService.delete(existingFilename);
        }

        userRepository.delete(user);
    }

    @Transactional
    public UserProfileDTO updateUserPreferences(String userEmail, UserPreferencesDTO dto) {
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + userEmail));

        user.setChatBackgroundSetting(dto.getChatBackgroundSetting());
        user.setFontSizeSetting(dto.getFontSizeSetting());

        User updatedUser = userRepository.save(user);
        return mapUserToUserProfileDTO(updatedUser);
    }

    private UserProfileDTO mapUserToUserProfileDTO(User user) {
        return UserProfileDTO.builder()
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .profilePictureUrl(user.getProfilePictureUrl())
                .chatBackgroundSetting(user.getChatBackgroundSetting())
                .fontSizeSetting(user.getFontSizeSetting())
                .build();
    }

    private void broadcastUserUpdateToSharedBoards(String userEmail) {
        List<GroupMember> memberships = groupMemberRepository.findAllByUserEmail(userEmail);
        BoardUpdateDTO payload = new BoardUpdateDTO(BoardUpdateDTO.UpdateType.MEMBERS_UPDATED, userEmail);

        for (GroupMember membership : memberships) {
            Long boardId = membership.getBoardGroupId();
            String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + boardId;
            messagingTemplate.convertAndSend(destination, payload);
        }
    }
}