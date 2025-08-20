import { useCallback, useMemo } from 'react';

import toast from 'react-hot-toast';
import logger from 'utils/logger';

import { WEBSOCKET_DESTINATIONS } from 'constants/ApiConstants';
import { useWebSocket } from 'hooks/common/useSocket';
import transactionService from 'services/transactionService';
import websocketService from 'services/websocketService';
import type { ChatTransactionConfig, EnhancedChatMessage } from 'types/ChatTypes';

interface ChatMessagePayload {
  type: string;
  content: string;
  timestamp: number;
  boardId: number;
  senderEmail: string;
  senderFullName: string;
  senderProfilePictureUrl?: string;
  instanceId?: string;
}

/**
 * Simplified chat transaction hook using CENTRALIZED transaction service
 * 
 * This eliminates the multiple hook instances problem by using a single
 * centralized transaction service for all transactions (chat + drawing).
 */
export const useChatTransaction = (config: ChatTransactionConfig) => {
  const { boardId, userEmail, userFullName, userProfilePictureUrl, messages, setMessages } = config;
  
  // Use WebSocket context for connection status
  const { isSocketConnected } = useWebSocket();

  // Success callback for centralized service
  const handleSuccess = useCallback((_payload: ChatMessagePayload, transactionId: string) => {
    logger.debug(`[CHAT] 🏭 CENTRALIZED success for transaction: ${transactionId}`);
    
    // Update message status to confirmed
    setMessages((prev) => prev.map((msg) => {
      const enhancedMsg = msg as EnhancedChatMessage;
      if (enhancedMsg.transactionId === transactionId) {
        if (enhancedMsg.transactionStatus !== 'confirmed') {
          logger.debug(`[CHAT] Updating message ${transactionId} status to confirmed`);
          return { ...enhancedMsg, transactionStatus: 'confirmed' };
        }
      }
      return msg;
    }));
  }, [setMessages]);

  // Failure callback for centralized service
  const handleFailure = useCallback((error: Error, _payload: ChatMessagePayload, transactionId: string) => {
    logger.error(`[CHAT] 🏭 CENTRALIZED failure for transaction: ${transactionId}`, error);
    
    // Update message status to failed
    setMessages((prev) => prev.map((msg) => 
      (msg as EnhancedChatMessage).transactionId === transactionId 
        ? { ...msg, transactionStatus: 'failed' }
        : msg,
    ));
    
    // Show appropriate error toast
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
    } else {
      toast.error('Failed to send message - please try again', {
        duration: 4000,
        icon: '❌',
      });
    }
  }, [setMessages]);

  // Send chat message function using CENTRALIZED service
  const sendChatMessage = useCallback(
    async (content: string): Promise<string> => {
      const trimmedContent = content.trim();
      
      if (!trimmedContent) {
        throw new Error('Message content cannot be empty');
      }

      if (trimmedContent.length > 5000) {
        throw new Error('Message is too long (maximum 5000 characters)');
      }

      const transactionId = crypto.randomUUID();
      const payload: ChatMessagePayload = {
        type: 'CHAT',
        content: trimmedContent,
        timestamp: Date.now(),
        boardId: boardId,
        senderEmail: userEmail,
        senderFullName: userFullName,
        senderProfilePictureUrl: userProfilePictureUrl,
        instanceId: transactionId,
      };

      logger.debug(`[CHAT] 🏭 Using CENTRALIZED service for transaction: ${transactionId}`);

      // Add optimistic message immediately
      const optimisticMessage: EnhancedChatMessage = {
        id: 0, // Temporary ID, will be replaced by server
        type: 'CHAT' as const,
        content: payload.content,
        timestamp: payload.timestamp.toString(),
        senderEmail: userEmail,
        senderFullName: userFullName,
        senderProfilePictureUrl: userProfilePictureUrl || null,
        instanceId: payload.instanceId,
        transactionId,
        transactionStatus: 'sending',
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Check connection
      if (!isSocketConnected) {
        const error = new Error('WebSocket not connected');
        handleFailure(error, payload, transactionId);
        throw error;
      }

      try {
        // Create transaction in centralized service
        transactionService.createTransaction(transactionId, payload, 10000, handleSuccess, handleFailure);
        
        // Send message via WebSocket
        await websocketService.sendMessage(WEBSOCKET_DESTINATIONS.SEND_MESSAGE, payload);
        
        logger.debug(`[CHAT] 🏭 Message sent successfully with centralized transaction: ${transactionId}`);
        return transactionId;
      } catch (error) {
        logger.error('[CHAT] Failed to send message:', error);
        handleFailure(error as Error, payload, transactionId);
        throw error;
      }
    },
    [
      userEmail, 
      userFullName, 
      userProfilePictureUrl, 
      boardId, 
      isSocketConnected, 
      setMessages, 
      handleSuccess, 
      handleFailure,
    ],
  );

  // Enhanced messages with centralized transaction status
  const allMessages = useMemo((): EnhancedChatMessage[] => {
    return messages.map((msg): EnhancedChatMessage => {
      const enhancedMsg = msg as EnhancedChatMessage;
      
      // Check centralized transaction service for status
      if (enhancedMsg.transactionId) {
        if (transactionService.isPending(enhancedMsg.transactionId)) {
          const status = transactionService.getTransactionStatus(enhancedMsg.transactionId);
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
      
      // No transaction ID - server message
      return {
        ...enhancedMsg,
        transactionStatus: 'confirmed',
      };
    });
  }, [messages]);

  return {
    sendChatMessage,
    allMessages,
    commitTransaction: (id: string) => transactionService.commitTransaction(id),
    pendingMessageCount: transactionService.getPendingCount(),
    getTransactionStatus: (id: string) => transactionService.getTransactionStatus(id),
  };
};