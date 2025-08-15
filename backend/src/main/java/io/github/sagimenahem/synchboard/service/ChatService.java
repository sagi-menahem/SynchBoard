package io.github.sagimenahem.synchboard.service;

import static io.github.sagimenahem.synchboard.constants.WebSocketConstants.WEBSOCKET_BOARD_TOPIC_PREFIX;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.github.sagimenahem.synchboard.constants.LoggingConstants;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.websocket.ChatMessageDTO;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.Message;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.GroupBoardRepository;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import io.github.sagimenahem.synchboard.repository.MessageRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
        log.debug("Processing chat message for board {} from user: {}", request.getBoardId(),
                userEmail);

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
        log.info(LoggingConstants.CHAT_MESSAGE_SENT, request.getBoardId(), userEmail,
                messageToSave.getMessageId());

        // DIAGNOSTIC LOG: Message saved to DB with details for broadcast
        log.debug("[DIAGNOSTIC] Message saved to DB. MessageID: {}, InstanceID to be broadcasted: {}", 
                 messageToSave.getMessageId(), request.getInstanceId());

        // Create response with the instanceId echoed back for client-side transaction matching
        ChatMessageDTO.Response response = mapMessageToDto(messageToSave, request.getInstanceId());

        String destination = WEBSOCKET_BOARD_TOPIC_PREFIX + request.getBoardId();
        
        // DIAGNOSTIC LOG: Critical broadcast point - exact destination and full payload
        log.info("[DIAGNOSTIC] Broadcasting chat message. Topic: {}, Payload: {}", destination, response.toString());
        
        messagingTemplate.convertAndSend(destination, response);
        log.debug("Chat message broadcasted to topic: {} with instanceId: {}", destination, request.getInstanceId());
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDTO.Response> getMessagesForBoard(Long boardId, String userEmail) {
        log.debug("Fetching messages for board {} by user: {}", boardId, userEmail);

        if (!groupMemberRepository.existsByUserEmailAndBoardGroupId(userEmail, boardId)) {
            log.warn(LoggingConstants.AUTH_ACCESS_DENIED, userEmail, "board " + boardId);
            throw new AccessDeniedException(MessageConstants.AUTH_NOT_MEMBER);
        }

        List<Message> messages = messageRepository.findByBoardWithSender(boardId);

        log.info("Retrieved {} messages for board {} by user: {}", messages.size(), boardId,
                userEmail);
        return messages.stream().map(message -> mapMessageToDto(message, null)).collect(Collectors.toList());
    }

    // Overloaded method to include instanceId for real-time messages
    private ChatMessageDTO.Response mapMessageToDto(Message message, String instanceId) {
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

        return ChatMessageDTO.Response.builder()
                .id(message.getMessageId()) // Include message ID
                .type(ChatMessageDTO.Response.MessageType.CHAT)
                .content(message.getMessageContent())
                .timestamp(message.getTimestamp())
                .senderEmail(senderEmail)
                .senderFullName(senderFullName)
                .senderProfilePictureUrl(senderProfilePictureUrl)
                .instanceId(instanceId) // Echo back the client's transaction ID
                .build();
    }

}