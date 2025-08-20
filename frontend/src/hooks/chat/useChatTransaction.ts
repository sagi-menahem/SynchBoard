import { useMemo, useCallback, useEffect, useRef } from 'react';

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
      transactionId: string
    ): ChatMessageResponse[] => {
      const optimisticMessage: EnhancedChatMessage = {
        id: 0, // Temporary ID, will be replaced by server
        content: payload.content,
        timestamp: payload.timestamp,
        senderEmail: userEmail,
        senderFullName: userFullName,
        senderProfilePictureUrl: userProfilePictureUrl || null,
        instanceId: payload.instanceId,
        transactionId,
        transactionStatus: 'pending',
      };

      logger.debug(`Adding optimistic chat message with transactionId: ${transactionId}`);
      return [...currentMessages, optimisticMessage];
    },

    // Rollback update: Remove message from UI on failure
    rollbackUpdate: (
      currentMessages: ChatMessageResponse[],
      transactionId: string
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

    // Success callback - called when server confirms message was received
    onSuccess: (payload: any, transactionId: string) => {
      logger.debug(`Message confirmed: ${transactionId}`);
      // Update UI to show message as successfully sent
      setMessages(prev => prev.map((msg: any) => 
        msg.transactionId === transactionId 
          ? { ...msg, transactionStatus: 'confirmed' }
          : msg
      ));
    },

    // Failure callback
    onFailure: (error: Error, payload: any, transactionId: string) => {
      logger.error(`Chat message failed: ${transactionId}`, error);
      
      // Update message status to failed
      setMessages(prev => prev.map((msg: any) => 
        msg.transactionId === transactionId 
          ? { ...msg, transactionStatus: 'failed' }
          : msg
      ));
      
      // Show error toast
      toast.error('Message failed to send - it will be retried when connection is restored');
    },

    // Rollback callback - only called for messages that genuinely failed to send
    onRollback: (transactionId: string, payload: any) => {
      const messagePreview = payload.content?.substring(0, 25) + (payload.content?.length > 25 ? '...' : '');
      logger.warn(`Message failed to send: "${messagePreview}"`);
      
      // Show toast only for genuine failures (recent transactions that never reached server)
      toast.error(`Failed to send: "${messagePreview}"`, {
        duration: 4000,
        id: `chat-rollback-${transactionId}` // Prevent duplicate toasts
      });
    },
  }), [boardId, userEmail, userFullName, userProfilePictureUrl, setMessages]);

  // Initialize transaction hook
  const {
    sendTransactionalAction,
    getTransactionStatus,
    isPending,
    commitTransaction,
    pendingCount
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
    [sendTransactionalAction, userEmail, userFullName, userProfilePictureUrl]
  );

  // Track transactions that need to be committed
  const pendingCommits = useRef<Set<string>>(new Set());
  
  // Effect to handle transaction commits safely outside of render
  useEffect(() => {
    const toCommit: string[] = [];
    
    currentMessages.forEach(msg => {
      const enhancedMsg = msg as EnhancedChatMessage;
      
      // Check if this message has a transactionId, is pending, and has server confirmation
      if (enhancedMsg.transactionId && 
          isPending(enhancedMsg.transactionId) && 
          enhancedMsg.id && enhancedMsg.id > 0 &&
          !pendingCommits.current.has(enhancedMsg.transactionId)) {
        
        logger.debug(`Queueing transaction commit for ${enhancedMsg.transactionId} - server confirmation received (ID: ${enhancedMsg.id})`);
        toCommit.push(enhancedMsg.transactionId);
        pendingCommits.current.add(enhancedMsg.transactionId);
      }
    });
    
    // Commit all detected confirmations
    toCommit.forEach(transactionId => {
      commitTransaction(transactionId);
      // Remove from pending after committing
      pendingCommits.current.delete(transactionId);
    });
  }, [currentMessages, isPending, commitTransaction]);

  // Simple message list with transaction status
  const allMessages = useMemo((): EnhancedChatMessage[] => {
    return currentMessages.map((msg): EnhancedChatMessage => {
      const enhancedMsg = msg as EnhancedChatMessage;
      
      // Check if this message has a transactionId and is pending
      if (enhancedMsg.transactionId && isPending(enhancedMsg.transactionId)) {
        // Message is pending - check if we have server confirmation
        const hasServerConfirmation = enhancedMsg.id && enhancedMsg.id > 0;
        
        return {
          ...enhancedMsg,
          transactionStatus: hasServerConfirmation ? 'confirmed' : 'pending'
        };
      }
      
      return {
        ...enhancedMsg,
        transactionStatus: 'confirmed'
      };
    });
  }, [currentMessages, isPending]);

  return {
    sendChatMessage,
    allMessages,
    pendingMessageCount: pendingCount,
  };
};