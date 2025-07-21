// File: backend/src/main/java/com/synchboard/backend/service/ChatService.java
package com.synchboard.backend.service;

import com.synchboard.backend.dto.websocket.ChatMessageDTO;
import com.synchboard.backend.entity.GroupBoard;
import com.synchboard.backend.entity.Message;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.repository.GroupBoardRepository;
import com.synchboard.backend.repository.MessageRepository;
import com.synchboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.synchboard.backend.exception.ResourceNotFoundException;
import com.synchboard.backend.repository.GroupMemberRepository;
import org.springframework.security.access.AccessDeniedException;
import java.util.List;
import java.util.stream.Collectors;

import java.security.Principal;
import java.time.LocalDateTime;

import static com.synchboard.backend.config.ApplicationConstants.*;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final GroupBoardRepository groupBoardRepository;
    private final SimpMessageSendingOperations messagingTemplate;
    private final GroupMemberRepository groupMemberRepository;

    @Transactional
    public void processAndSaveMessage(ChatMessageDTO.Request request, Principal principal) {
        String userEmail = principal.getName();

        User senderUser = userRepository.findById(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + userEmail));

        GroupBoard board = groupBoardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new RuntimeException(BOARD_NOT_FOUND + request.getBoardId()));

        Message messageToSave = Message.builder()
                .board(board)
                .sender(senderUser)
                .messageContent(request.getContent())
                .build();
        messageRepository.save(messageToSave);

        String fullName = senderUser.getFirstName() + " " + senderUser.getLastName();
        // TODO name of the sender
        ChatMessageDTO.Response response = ChatMessageDTO.Response.builder()
                .type(ChatMessageDTO.Response.MessageType.CHAT)
                .content(request.getContent())
                .sender(fullName)
                .timestamp(LocalDateTime.now())
                .build();

        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();
        messagingTemplate.convertAndSend(destination, response);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDTO.Response> getMessagesForBoard(Long boardId, String userEmail) {

        if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
            throw new AccessDeniedException(ERROR_ACCESS_DENIED_NOT_A_MEMBER_OF_BOARD);
        }

        if (!groupBoardRepository.existsById(boardId)) {
            throw new ResourceNotFoundException(BOARD_NOT_FOUND + boardId);
        }

        List<Message> messages = messageRepository.findAllByBoard_BoardGroupIdOrderByTimestampAsc(boardId);

        return messages.stream()
                .map(this::mapMessageToDto)
                .collect(Collectors.toList());
    }

    private ChatMessageDTO.Response mapMessageToDto(Message message) {
        String senderName = "Unknown User";
        if (message.getSender() != null) {
            senderName = message.getSender().getFirstName() + " " + message.getSender().getLastName();
        }

        return ChatMessageDTO.Response.builder()
                .type(ChatMessageDTO.Response.MessageType.CHAT)
                .content(message.getMessageContent())
                .sender(senderName)
                .timestamp(message.getTimestamp())
                .build();
    }
}