import { useCallback, useMemo } from 'react';

import toast from 'react-hot-toast';
import logger from 'utils/Logger';

import { WEBSOCKET_DESTINATIONS } from 'constants/ApiConstants';
import { useWebSocketTransaction } from 'hooks/common/useWebSocketTransaction';
import type { ChatTransactionConfig, EnhancedChatMessage } from 'types/ChatTypes';
import type { ChatMessageResponse } from 'types/MessageTypes';

/**
 * Enhanced chat transaction hook with offline queueing and optimistic updates
 * 
 * This hook manages the complete lifecycle of chat message transactions:
 * - Applies optimistic updates (messages appear immediately)
 * - Handles offline queueing when connection is unavailable
 * - Manages transaction status updates for UI feedback
 * - Provides robust error handling with user notifications
 */
export const useChatTransaction = (config: ChatTransactionConfig) => {
  const { boardId, userEmail, userFullName, userProfilePictureUrl, messages, setMessages } = config;

  // Memoize current messages to prevent unnecessary re-renders
  const currentMessages = useMemo(() => messages, [messages]);

  // Create transaction configuration
  const transactionConfig = useMemo(() => ({
    destination: WEBSOCKET_DESTINATIONS.SEND_MESSAGE,
    actionType: 'CHAT' as const,
    
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

    // Success callback - handles both direct sends and queued message confirmations
    onSuccess: (payload: any, transactionId: string) => {
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

    // Failure callback
    onFailure: (error: Error, payload: any, transactionId: string) => {
      logger.error(`Chat message failed: ${transactionId}`, error);
      
      // Update message status to failed
      setMessages((prev) => prev.map((msg: any) => 
        msg.transactionId === transactionId 
          ? { ...msg, transactionStatus: 'failed' }
          : msg,
      ));
      
      // Show error toast
      toast.error('Message failed to send - it will be retried when connection is restored');
    },

    // Rollback callback - aggregated for all rolled back messages
    onRollback: (rolledBackTransactions: { id: string; payload: any }[]) => {
      const count = rolledBackTransactions.length;
      logger.warn(`${count} chat messages rolled back due to connection failure`);
      
      if (count === 1) {
        toast.error('Message will be sent when reconnected');
      } else {
        toast.error(`${count} messages will be sent when reconnected`);
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
        boardId: boardId, // CRITICAL FIX: Include boardId in payload
        senderEmail: userEmail,
        senderFullName: userFullName,
        senderProfilePictureUrl: userProfilePictureUrl,
      };

      try {
        const transactionId = await sendTransactionalAction(payload);
        logger.debug(`Chat message queued/sent with transaction ID: ${transactionId}`);
        return transactionId;
      } catch (error) {
        logger.error('Failed to send chat message:', error);
        throw error;
      }
    },
    [sendTransactionalAction, userEmail, userFullName, userProfilePictureUrl, boardId],
  );

  // Enhanced messages with transaction status
  const allMessages = useMemo((): EnhancedChatMessage[] => {
    return currentMessages.map((msg): EnhancedChatMessage => {
      const enhancedMsg = msg as EnhancedChatMessage;
      
      // CRITICAL FIX: Comprehensive transaction status logic
      if (enhancedMsg.transactionId) {
        // Check if transaction is still pending (not committed yet)
        if (isPending(enhancedMsg.transactionId)) {
          const status = getTransactionStatus(enhancedMsg.transactionId);
          return {
            ...enhancedMsg,
            transactionStatus: status || 'pending',
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
  }, [currentMessages, isPending, getTransactionStatus, pendingCount]);

  return {
    sendChatMessage,
    allMessages,
    commitTransaction,
    pendingMessageCount: pendingCount,
    getTransactionStatus,
  };
};