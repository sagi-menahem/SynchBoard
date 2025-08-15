import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/Logger';

import { WEBSOCKET_DESTINATIONS } from 'constants';
import { useWebSocketTransaction } from 'hooks/common';
import type { ChatMessageResponse, SendChatMessageRequest } from 'types/MessageTypes';

/**
 * Enhanced chat message interface with pending and failed state support
 */
interface PendingChatMessage extends ChatMessageResponse {
  isPending?: boolean;
  transactionId?: string;
  isFailed?: boolean;
}

/**
 * Configuration for the chat transaction hook
 */
interface UseChatTransactionConfig {
  /** Current board ID */
  boardId: number;
  /** Current chat messages */
  messages: ChatMessageResponse[];
  /** Function to update chat messages */
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
  /** Current user's email */
  userEmail: string;
  /** Current user's full name */
  userFullName: string;
  /** Current user's profile picture URL (optional) */
  userProfilePictureUrl?: string;
}

/**
 * Return type for the chat transaction hook
 */
interface ChatTransactionResult {
  /** Function to send a chat message with optimistic updates */
  sendChatMessage: (content: string) => Promise<string>;
  /** Number of pending chat messages */
  pendingMessageCount: number;
  /** Check if a specific message is pending */
  isMessagePending: (transactionId: string) => boolean;
  /** Get all messages including pending ones */
  allMessages: PendingChatMessage[];
}

/**
 * Custom hook for managing chat message transactions with optimistic updates
 * 
 * This hook provides a robust chat messaging experience by:
 * - Immediately showing sent messages in the chat (optimistic update)
 * - Marking pending messages with visual indicators
 * - Automatically rolling back failed messages on connection issues
 * - Providing user feedback for failed message sending
 * - Preventing message duplication by replacing pending messages with confirmed ones
 * 
 * @param config Configuration object containing board ID, messages, and user info
 * @returns Object with chat transaction management functions
 */
export const useChatTransaction = ({
  boardId,
  messages,
  setMessages,
  userEmail,
  userFullName,
  userProfilePictureUrl,
}: UseChatTransactionConfig): ChatTransactionResult => {
  const { t } = useTranslation();

  // Use the reusable transaction hook for chat messages
  const { 
    sendTransactionalAction, 
    pendingCount, 
    isPending
  } = useWebSocketTransaction<SendChatMessageRequest, ChatMessageResponse[]>({
    destination: WEBSOCKET_DESTINATIONS.SEND_MESSAGE,
    optimisticUpdate: (currentMessages, messageRequest, transactionId) => {
      // Create an optimistic message that appears immediately in the chat
      const optimisticMessage: PendingChatMessage = {
        type: 'CHAT',
        content: messageRequest.content,
        timestamp: new Date().toISOString(),
        senderEmail: userEmail,
        senderFullName: userFullName,
        senderProfilePictureUrl: userProfilePictureUrl || null,
        instanceId: transactionId, // Use transaction ID as instanceId for server matching
        isPending: true,
        transactionId: transactionId
      };

      return [...currentMessages, optimisticMessage];
    },
    rollbackUpdate: (currentMessages, transactionId) => {
      // Mark the specific message as failed instead of removing it
      return currentMessages.map(msg => {
        const pendingMsg = msg as PendingChatMessage;
        if (pendingMsg.transactionId === transactionId) {
          return {
            ...pendingMsg,
            isPending: false,
            isFailed: true
          };
        }
        return msg;
      });
    },
    validatePayload: (messageRequest) => {
      // Validate message content
      if (!messageRequest.content || !messageRequest.content.trim()) {
        logger.error('Cannot send empty chat message');
        return false;
      }
      
      // Check content length (reasonable limit for chat messages)
      if (messageRequest.content.length > 5000) {
        logger.error(`Chat message too long: ${messageRequest.content.length} characters`);
        return false;
      }
      
      return true;
    },
    onSuccess: (_, transactionId) => {
      logger.debug(`Chat message sent successfully: ${transactionId}`);
    },
    onFailure: (error, messageRequest, transactionId) => {
      if (error.message === 'Payload validation failed') {
        if (!messageRequest.content?.trim()) {
          toast.error(t('chat.emptyMessage', 'Cannot send empty message'));
        } else {
          toast.error(t('chat.messageTooLong', 'Message is too long. Please shorten it.'));
        }
      } else {
        toast.error(t('chat.sendFailed', 'Failed to send message. Please try again.'));
      }
      logger.error(`Chat message failed: ${transactionId}`, error);
    },
    onRollback: (transactionId) => {
      toast.error(t('chat.messageFailedToSend', 'Message failed to send. Check your connection.'));
      logger.warn(`Chat message marked as failed: ${transactionId}`);
    }
  }, messages, setMessages);

  /**
   * Send a chat message with optimistic update
   * @param content The message content to send
   * @returns Promise that resolves with the transaction ID
   */
  const sendChatMessage = useCallback(
    async (content: string): Promise<string> => {
      const messageRequest: SendChatMessageRequest = {
        content: content.trim(),
        boardId: boardId,
        // instanceId will be set by the transaction hook using the generated transactionId
      };

      try {
        const transactionId = await sendTransactionalAction(messageRequest);
        logger.debug(`Chat message queued: ${transactionId}`);
        return transactionId;
      } catch (error) {
        logger.error('Failed to send chat message:', error);
        throw error;
      }
    },
    [boardId, sendTransactionalAction]
  );

  /**
   * Get all messages including pending ones with proper typing
   * This filters out any duplicates and marks pending messages appropriately
   */
  const allMessages: PendingChatMessage[] = messages.map(msg => {
    const pendingMsg = msg as PendingChatMessage;
    
    // Check if this message is still pending
    if (pendingMsg.transactionId && isPending(pendingMsg.transactionId)) {
      return { ...pendingMsg, isPending: true };
    }
    
    return pendingMsg;
  });

  return {
    sendChatMessage,
    pendingMessageCount: pendingCount,
    isMessagePending: isPending,
    allMessages,
  };
};