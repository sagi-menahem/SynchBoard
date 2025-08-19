import { useCallback, useMemo } from 'react';

import toast from 'react-hot-toast';
import logger from 'utils/logger';

import { WEBSOCKET_DESTINATIONS } from 'constants/ApiConstants';
import { useWebSocketTransaction } from 'hooks/common/useWebSocketTransaction';
import type { ChatTransactionConfig, EnhancedChatMessage } from 'types/ChatTypes';
import type { ChatMessageResponse } from 'types/MessageTypes';

/**
 * Simplified chat transaction hook with optimistic updates and timeout handling
 * 
 * This hook manages the complete lifecycle of chat message transactions:
 * - Applies optimistic updates (messages appear immediately)
 * - Handles transaction status updates for UI feedback
 * - Provides robust error handling with user notifications
 * - Automatic 10-second timeout for pending transactions
 */
export const useChatTransaction = (config: ChatTransactionConfig) => {
  const { boardId, userEmail, userFullName, userProfilePictureUrl, messages, setMessages } = config;

  // Memoize current messages to prevent unnecessary re-renders
  const currentMessages = useMemo(() => messages, [messages]);

  // Create transaction configuration
  const transactionConfig = useMemo(() => ({
    destination: WEBSOCKET_DESTINATIONS.SEND_MESSAGE,
    
    // Optimistic update: Add message immediately to UI
    optimisticUpdate: (
      currentMessages: ChatMessageResponse[],
      payload: any,
      transactionId: string,
    ): ChatMessageResponse[] => {
      const optimisticMessage: EnhancedChatMessage = {
        id: 0, // Temporary ID, will be replaced by server
        type: 'CHAT' as const,
        content: payload.content,
        timestamp: payload.timestamp,
        senderEmail: userEmail,
        senderFullName: userFullName,
        senderProfilePictureUrl: userProfilePictureUrl || null,
        instanceId: payload.instanceId,
        transactionId,
        transactionStatus: 'sending',
      };

      logger.debug(`Adding optimistic chat message with transactionId: ${transactionId}`);
      return [...currentMessages, optimisticMessage];
    },

    // Rollback update: Remove message from UI on failure
    rollbackUpdate: (
      currentMessages: ChatMessageResponse[],
      transactionId: string,
    ): ChatMessageResponse[] => {
      logger.debug(`Rolling back chat message with transactionId: ${transactionId}`);
      return currentMessages.filter((msg: any) => msg.transactionId !== transactionId);
    },

    // Validation: Ensure message content is valid
    validatePayload: (payload: any): boolean => {
      if (!payload.content || typeof payload.content !== 'string') {
        return false;
      }
      
      const trimmedContent = payload.content.trim();
      return trimmedContent.length > 0 && trimmedContent.length <= 5000;
    },

    // Success callback - handles transaction confirmations
    onSuccess: (_payload: any, transactionId: string) => {
      logger.debug(`Chat message sent successfully: ${transactionId}`);
      
      // Update message status to confirmed as safety net
      setMessages((prev) => prev.map((msg: any) => {
        if (msg.transactionId === transactionId) {
          if (msg.transactionStatus !== 'confirmed') {
            logger.debug(`Updating message ${transactionId} status from ${msg.transactionStatus} to confirmed`);
            return { ...msg, transactionStatus: 'confirmed' };
          }
        }
        return msg;
      }));
    },

    // Failure callback - handles send failures and timeouts
    onFailure: (error: Error, _payload: any, transactionId: string) => {
      logger.error(`Chat message failed: ${transactionId}`, error);
      
      // Update message status to failed
      setMessages((prev) => prev.map((msg: any) => 
        msg.transactionId === transactionId 
          ? { ...msg, transactionStatus: 'failed' }
          : msg,
      ));
      
      // Show appropriate error toast with enhanced feedback
      if (error.message.includes('timeout')) {
        toast.error('Message timed out after 10 seconds - check your connection and try again', {
          duration: 6000,
          icon: '⏱️',
        });
      } else if (error.message.includes('not connected')) {
        toast.error('Connection lost - message failed to send. Will retry when reconnected.', {
          duration: 5000,
          icon: '📶',
        });
      } else if (error.message.includes('network')) {
        toast.error('Network error - please check your internet connection', {
          duration: 5000,
          icon: '🌐',
        });
      } else {
        toast.error('Failed to send message - please try again', {
          duration: 4000,
          icon: '❌',
        });
      }
    },

    // Rollback callback - aggregated for all rolled back messages
    onRollback: (rolledBackTransactions: { id: string; payload: any }[]) => {
      const count = rolledBackTransactions.length;
      logger.warn(`${count} chat messages rolled back due to connection failure`);
      
      if (count === 1) {
        toast.error('Message lost due to connection failure - please resend if needed', {
          duration: 6000,
          icon: '🔄',
        });
      } else {
        toast.error(`${count} messages lost due to connection failure - please resend if needed`, {
          duration: 7000,
          icon: '🔄',
        });
      }
    },
  }), [userEmail, userFullName, userProfilePictureUrl, setMessages]);

  // Initialize transaction hook
  const {
    sendTransactionalAction,
    getTransactionStatus,
    isPending,
    commitTransaction,
    pendingCount,
  } = useWebSocketTransaction(transactionConfig, currentMessages, setMessages);

  // Send chat message function
  const sendChatMessage = useCallback(
    async (content: string): Promise<string> => {
      const trimmedContent = content.trim();
      
      if (!trimmedContent) {
        throw new Error('Message content cannot be empty');
      }

      if (trimmedContent.length > 5000) {
        throw new Error('Message is too long (maximum 5000 characters)');
      }

      const payload = {
        type: 'CHAT',
        content: trimmedContent,
        timestamp: Date.now(),
        boardId: boardId,
        senderEmail: userEmail,
        senderFullName: userFullName,
        senderProfilePictureUrl: userProfilePictureUrl,
      };

      try {
        const transactionId = await sendTransactionalAction(payload);
        logger.debug(`Chat message sent with transaction ID: ${transactionId}`);
        return transactionId;
      } catch (error) {
        logger.error('Failed to send chat message:', error);
        throw error;
      }
    },
    [sendTransactionalAction, userEmail, userFullName, userProfilePictureUrl, boardId],
  );

  // Enhanced messages with simplified transaction status
  const allMessages = useMemo((): EnhancedChatMessage[] => {
    return currentMessages.map((msg): EnhancedChatMessage => {
      const enhancedMsg = msg as EnhancedChatMessage;
      
      // Simplified transaction status logic
      if (enhancedMsg.transactionId) {
        // Check if transaction is still pending (not committed yet)
        if (isPending(enhancedMsg.transactionId)) {
          const status = getTransactionStatus(enhancedMsg.transactionId);
          return {
            ...enhancedMsg,
            transactionStatus: status || 'confirmed',
          };
        } else {
          // Transaction was committed - mark as confirmed
          return {
            ...enhancedMsg,
            transactionStatus: 'confirmed',
          };
        }
      }
      
      // No transaction ID - server message or pre-transaction message
      return {
        ...enhancedMsg,
        transactionStatus: 'confirmed',
      };
    });
  }, [currentMessages, isPending, getTransactionStatus]);

  return {
    sendChatMessage,
    allMessages,
    commitTransaction,
    pendingMessageCount: pendingCount,
    getTransactionStatus,
  };
};