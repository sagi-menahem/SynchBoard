import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import WebSocketService from 'features/websocket/services/websocketService';
import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { WEBSOCKET_DESTINATIONS } from 'shared/constants/ApiConstants';
import logger from 'shared/utils/logger';

/**
 * User information structure for chat message attribution and display.
 */
export interface UserInfo {
  // Full display name of the user for message headers
  userFullName: string;
  // Optional profile picture URL for avatar display
  userProfilePictureUrl?: string | null;
}

/**
 * WebSocket message payload structure for chat messages sent to the server.
 * Contains all necessary information for message broadcasting and persistence.
 */
export interface ChatMessagePayload {
  // Message type identifier for WebSocket routing
  type: 'CHAT';
  // Text content of the message
  content: string;
  // Timestamp when message was created (milliseconds)
  timestamp: number;
  // Unique identifier for message tracking and deduplication
  instanceId: string;
  // Board identifier for message context
  boardId: number;
  // Email of message sender for identity verification
  senderEmail: string | null;
  // Display name of sender for UI presentation
  senderFullName: string;
  // Profile picture URL for sender avatar
  senderProfilePictureUrl: string | null;
}

/**
 * Custom hook for managing chat message operations including creation, validation, and sending.
 * Provides utilities for optimistic updates, message payload creation, and WebSocket communication.
 * Implements comprehensive validation and error handling for reliable message transmission.
 * 
 * Key features:
 * - Message validation with length and content checks
 * - Optimistic message creation for immediate UI feedback
 * - WebSocket payload construction with proper typing
 * - Transaction-based message tracking for conflict resolution
 * - Comprehensive error handling and logging
 * - Integration with React's flushSync for immediate updates
 * 
 * @returns Object containing message operations and utilities
 */
export const useChatMessages = () => {
  const { t } = useTranslation(['chat', 'common']);

  // Creates optimistic message for immediate UI feedback before server confirmation
  const createOptimisticMessage = useCallback(
    (
      content: string,
      instanceId: string,
      userEmail: string | null,
      userInfo: UserInfo,
    ): ChatMessageResponse & { transactionId: string } => {
      return {
        id: -1, // Negative ID prevents conflicts with server-assigned positive IDs
        type: 'CHAT',
        content: content.trim(),
        timestamp: new Date().toISOString(),
        senderEmail: userEmail ?? '',
        senderFullName: userInfo.userFullName,
        senderProfilePictureUrl: userInfo.userProfilePictureUrl ?? null,
        instanceId,
        transactionId: instanceId,
      };
    },
    [],
  );

  // Creates WebSocket message payload with unique instance ID for server transmission
  const createMessagePayload = useCallback(
    (
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
    },
    [],
  );

  // Validates message content for length and empty content constraints
  const validateMessage = useCallback(
    (content: string): { isValid: boolean; error?: string } => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        return { isValid: false, error: t('chat:emptyMessage') };
      }

      // Prevent database overflow and maintain readable chat experience
      if (trimmedContent.length > 5000) {
        return { isValid: false, error: t('chat:messageTooLong') };
      }

      return { isValid: true };
    },
    [t],
  );

  // Main function to send chat messages with optimistic updates and error handling
  const sendMessage = useCallback(
    async (
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

      // Start pending timer for visual feedback
      startPendingTimer?.(instanceId);
      // Use flushSync to immediately update UI before WebSocket send
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
    },
    [validateMessage, createMessagePayload, createOptimisticMessage],
  );

  return {
    sendMessage,
    validateMessage,
    createOptimisticMessage,
    createMessagePayload,
  };
};
