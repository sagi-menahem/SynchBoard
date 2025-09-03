import { useCallback } from 'react';

import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import WebSocketService from 'features/websocket/services/websocketService';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { WEBSOCKET_DESTINATIONS } from 'shared/constants/ApiConstants';
import logger from 'shared/utils/logger';

export interface UserInfo {
  userFullName: string;
  userProfilePictureUrl?: string | null;
}

export interface ChatMessagePayload {
  type: 'CHAT';
  content: string;
  timestamp: number;
  instanceId: string;
  boardId: number;
  senderEmail: string | null;
  senderFullName: string;
  senderProfilePictureUrl: string | null;
}

export const useChatMessages = () => {
  const { t } = useTranslation(['chat', 'common']);

  const createOptimisticMessage = useCallback((
    content: string,
    instanceId: string,
    userEmail: string | null,
    userInfo: UserInfo,
  ): ChatMessageResponse & { transactionId: string } => {
    return {
      id: -1,
      type: 'CHAT',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      senderEmail: userEmail ?? '',
      senderFullName: userInfo.userFullName,
      senderProfilePictureUrl: userInfo.userProfilePictureUrl ?? null,
      instanceId,
      transactionId: instanceId,
    };
  }, []);

  const createMessagePayload = useCallback((
    content: string,
    boardId: number,
    userEmail: string | null,
    userInfo: UserInfo,
  ): { payload: ChatMessagePayload; instanceId: string } => {
    const instanceId = crypto.randomUUID();
    const payload: ChatMessagePayload = {
      type: 'CHAT',
      content: content.trim(),
      timestamp: Date.now(),
      instanceId,
      boardId,
      senderEmail: userEmail,
      senderFullName: userInfo.userFullName,
      senderProfilePictureUrl: userInfo.userProfilePictureUrl ?? null,
    };

    return { payload, instanceId };
  }, []);

  const validateMessage = useCallback((content: string): { isValid: boolean; error?: string } => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      return { isValid: false, error: t('chat:emptyMessage') };
    }

    if (trimmedContent.length > 5000) {
      return { isValid: false, error: t('chat:messageTooLong') };
    }

    return { isValid: true };
  }, [t]);

  const sendMessage = useCallback(async (
    content: string,
    boardId: number,
    userEmail: string | null,
    userInfo: UserInfo,
    addOptimisticMessage: (message: ChatMessageResponse & { transactionId: string }) => void,
    startPendingTimer?: (transactionId: string) => void,
  ): Promise<string> => {
    const validation = validateMessage(content);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const { payload, instanceId } = createMessagePayload(content, boardId, userEmail, userInfo);
    const optimisticMessage = createOptimisticMessage(content, instanceId, userEmail, userInfo);
    
    startPendingTimer?.(instanceId);
    // Force immediate render to ensure pending state is visible
    flushSync(() => {
      addOptimisticMessage(optimisticMessage);
    });

    try {
      WebSocketService.sendMessage(WEBSOCKET_DESTINATIONS.SEND_MESSAGE, payload);
      return instanceId;
    } catch (error) {
      logger.error('Failed to send chat message:', error);
      throw error;
    }
  }, [validateMessage, createMessagePayload, createOptimisticMessage]);

  return {
    sendMessage,
    validateMessage,
    createOptimisticMessage,
    createMessagePayload,
  };
};