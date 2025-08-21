import { useCallback, useMemo } from 'react';

import toast from 'react-hot-toast';
import logger from 'utils/Logger';

import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from 'constants/ApiConstants';
import { useSocketSubscription } from 'hooks/common/useSocket';
import { useWebSocketTransaction } from 'hooks/common/useWebSocketTransaction';
import type { ChatTransactionConfig, EnhancedChatMessage } from 'types/ChatTypes';
import type { ChatMessageResponse } from 'types/MessageTypes';

export const useChatTransaction = (config: ChatTransactionConfig) => {
  const { boardId, userEmail, userFullName, userProfilePictureUrl, messages, setMessages } = config;

  const currentMessages = useMemo(() => messages, [messages]);

  const transactionConfig = useMemo(() => ({
    destination: WEBSOCKET_DESTINATIONS.SEND_MESSAGE,
    actionType: 'CHAT' as const,
    optimisticUpdate: (
      currentMessages: ChatMessageResponse[],
      payload: { content: string; timestamp: number; instanceId: string },
      transactionId: string,
    ): ChatMessageResponse[] => {
      const optimisticMessage: EnhancedChatMessage = {
        id: 0,
        type: 'CHAT',
        content: payload.content,
        timestamp: new Date(payload.timestamp).toISOString(),
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

    rollbackUpdate: (
      currentMessages: ChatMessageResponse[],
      transactionId: string,
    ): ChatMessageResponse[] => {
      logger.debug(`Rolling back chat message with transactionId: ${transactionId}`);
      return currentMessages.filter((msg: ChatMessageResponse & { transactionId?: string }) => 
        msg.transactionId !== transactionId,
      );
    },

    validatePayload: (payload: Record<string, unknown>): boolean => {
      if (!payload.content || typeof payload.content !== 'string') {
        return false;
      }
      
      const trimmedContent = payload.content.trim();
      return trimmedContent.length > 0 && trimmedContent.length <= 5000;
    },

    onSuccess: (_: unknown, transactionId: string) => {
      logger.debug(`Message confirmed: ${transactionId}`);
      setMessages((prev) => prev.map((msg: ChatMessageResponse & { transactionId?: string }) => 
        msg.transactionId === transactionId 
          ? { ...msg, transactionStatus: 'confirmed' }
          : msg,
      ));
    },

    onFailure: (error: Error, _: unknown, transactionId: string) => {
      logger.error(`Chat message failed: ${transactionId}`, error);
      setMessages((prev) => prev.map((msg: ChatMessageResponse & { transactionId?: string }) => 
        msg.transactionId === transactionId 
          ? { ...msg, transactionStatus: 'failed' }
          : msg,
      ));
      toast.error('Message failed to send - it will be retried when connection is restored');
    },

    onRollback: (transactionId: string, payload: { content?: string }) => {
      const messagePreview = payload.content?.substring(0, 25) + ((payload.content?.length ?? 0) > 25 ? '...' : '');
      logger.warn(`Message failed to send: "${messagePreview}"`);
      toast.error(`Failed to send: "${messagePreview}"`, {
        duration: 4000,
        id: `chat-rollback-${transactionId}`,
      });
    },
  }), [userEmail, userFullName, userProfilePictureUrl, setMessages]);

  const {
    sendTransactionalAction,
    isPending,
    pendingCount,
    commitTransaction,
  } = useWebSocketTransaction(transactionConfig, currentMessages, setMessages);

  // Subscribe to board WebSocket topic to receive ONLY chat confirmations
  const handleChatConfirmation = useCallback(
    (payload: unknown) => {
      if (typeof payload !== 'object' || !payload) return;
      
      // ONLY handle CHAT messages, ignore all drawing/board messages
      if ('type' in payload && 'instanceId' in payload) {
        const message = payload as ChatMessageResponse & { instanceId: string };
        
        if (message.type === 'CHAT' && message.instanceId) {
          logger.debug(`Server confirmed CHAT: ${message.instanceId}`);
          commitTransaction(message.instanceId);
        }
        // Explicitly ignore drawing messages (OBJECT_ADD, OBJECT_DELETE, etc.)
      }
    },
    [commitTransaction]
  );

  // Subscribe to board topic for chat confirmations only
  useSocketSubscription(
    boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', 
    handleChatConfirmation, 
    'chat'
  );

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
        instanceId: crypto.randomUUID(),
        boardId: boardId,
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


  const allMessages = useMemo((): EnhancedChatMessage[] => {
    return currentMessages.map((msg): EnhancedChatMessage => {
      const enhancedMsg = msg as EnhancedChatMessage;
      
      if (enhancedMsg.transactionId && isPending(enhancedMsg.transactionId)) {
        const hasServerConfirmation = enhancedMsg.id && enhancedMsg.id > 0;
        
        return {
          ...enhancedMsg,
          transactionStatus: hasServerConfirmation ? 'confirmed' : 'pending',
        };
      }
      
      return {
        ...enhancedMsg,
        transactionStatus: 'confirmed',
      };
    });
  }, [currentMessages, isPending]);

  return {
    sendChatMessage,
    allMessages,
    pendingMessageCount: pendingCount,
  };
};