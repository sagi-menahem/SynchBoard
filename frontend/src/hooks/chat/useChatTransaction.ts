import { useCallback, useEffect, useMemo, useRef } from 'react';

import toast from 'react-hot-toast';
import logger from 'utils/Logger';

import { WEBSOCKET_DESTINATIONS } from 'constants/ApiConstants';
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
    commitTransaction,
    pendingCount,
  } = useWebSocketTransaction(transactionConfig, currentMessages, setMessages);

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

  const pendingCommits = useRef<Set<string>>(new Set());
  useEffect(() => {
    const toCommit: string[] = [];
    
    currentMessages.forEach((msg) => {
      const enhancedMsg = msg as EnhancedChatMessage;
      
      if (enhancedMsg.transactionId && 
          isPending(enhancedMsg.transactionId) && 
          enhancedMsg.id && enhancedMsg.id > 0 &&
          !pendingCommits.current.has(enhancedMsg.transactionId)) {
        
        logger.debug(`Queueing transaction commit for ${enhancedMsg.transactionId} - server confirmation received (ID: ${enhancedMsg.id})`);
        toCommit.push(enhancedMsg.transactionId);
        pendingCommits.current.add(enhancedMsg.transactionId);
      }
    });
    
    toCommit.forEach((transactionId) => {
      commitTransaction(transactionId);
      pendingCommits.current.delete(transactionId);
    });
  }, [currentMessages, isPending, commitTransaction]);

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