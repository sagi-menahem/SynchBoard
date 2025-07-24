// File: backend/src/main/java/com/synchboard/backend/service/ChatService.java
package com.synchboard.backend.service;

import static com.synchboard.backend.config.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.synchboard.backend.config.constants.MessageConstants;
import com.synchboard.backend.dto.websocket.ChatMessageDTO;
import com.synchboard.backend.entity.GroupBoard;
import com.synchboard.backend.entity.Message;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.exception.ResourceNotFoundException;
import com.synchboard.backend.repository.GroupBoardRepository;
import com.synchboard.backend.repository.GroupMemberRepository;
import com.synchboard.backend.repository.MessageRepository;
import com.synchboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final GroupBoardRepository groupBoardRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final SimpMessageSendingOperations messagingTemplate;

    @Transactional
    public void processAndSaveMessage(ChatMessageDTO.Request request, Principal principal) {
        String userEmail = principal.getName();

        User senderUser = userRepository.findById(userEmail).orElseThrow(
                () -> new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND + userEmail));

        GroupBoard board = groupBoardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        MessageConstants.BOARD_NOT_FOUND + request.getBoardId()));

        String fullNameSnapshot = senderUser.getFirstName() + " " + senderUser.getLastName();

        Message messageToSave = Message.builder().board(board).sender(senderUser)
                .messageContent(request.getContent()).senderFullNameSnapshot(fullNameSnapshot)
                .build();

        messageRepository.save(messageToSave);

        ChatMessageDTO.Response response = mapMessageToDto(messageToSave);

        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();
        messagingTemplate.convertAndSend(destination, response);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDTO.Response> getMessagesForBoard(Long boardId, String userEmail) {
        if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }

        List<Message> messages =
                messageRepository.findAllByBoard_BoardGroupIdOrderByTimestampAsc(boardId);

        return messages.stream().map(this::mapMessageToDto).collect(Collectors.toList());
    }

    private ChatMessageDTO.Response mapMessageToDto(Message message) {
        String senderEmail;
        String senderFullName;
        String senderProfilePictureUrl;

        if (message.getSender() != null) {
            User sender = message.getSender();
            senderEmail = sender.getEmail();
            senderFullName = sender.getFirstName() + " " + sender.getLastName();
            senderProfilePictureUrl = sender.getProfilePictureUrl();
        } else {
            senderEmail = "deleted-user";
            senderFullName = message.getSenderFullNameSnapshot();
            senderProfilePictureUrl = null;
        }

        return ChatMessageDTO.Response.builder().type(ChatMessageDTO.Response.MessageType.CHAT)
                .content(message.getMessageContent()).timestamp(message.getTimestamp())
                .senderEmail(senderEmail).senderFullName(senderFullName)
                .senderProfilePictureUrl(senderProfilePictureUrl).build();
    }
}
