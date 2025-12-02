import { AxiosError } from 'axios';
import { useAuth } from 'features/auth/hooks/useAuth';
import * as boardService from 'features/board/services/boardService';
import {
  ActionType,
  type ActionPayload,
  type BoardActionResponse,
} from 'features/board/types/BoardObjectTypes';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import type { BoardUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import { useCallback } from 'react';
import { WEBSOCKET_TOPICS } from 'shared/constants/ApiConstants';
import logger from 'shared/utils/logger';

import { useSocketSubscription } from './useSocket';

/**
 * Properties for the useWebSocketHandler hook defining board-specific WebSocket message handling.
 * Provides state setters and transaction handlers for real-time board collaboration.
 */
interface WebSocketHandlerProps {
  // Board identifier for WebSocket topic subscription
  boardId: number;
  // Unique session identifier to filter out own actions from remote updates
  sessionInstanceId: string;
  // Callback to update board name when details are changed by other users
  setBoardName: (name: string) => void;
  // Callback to handle loss of board access due to permission changes
  setAccessLost: (lost: boolean) => void;
  // State setter for canvas objects array with real-time updates
  setObjects: React.Dispatch<React.SetStateAction<ActionPayload[]>>;
  // State setter for chat messages array with real-time updates
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
  // Transaction handler for drawing operations to manage optimistic updates
  commitDrawingTransaction: (instanceId: string) => void;
  // Transaction handler for chat operations to manage optimistic updates
  commitChatTransaction: (instanceId: string) => void;
}

/**
 * Custom hook that manages board-specific WebSocket message handling and real-time collaboration.
 * Orchestrates different message types including board updates, drawing actions, and chat messages.
 * Implements optimistic UI updates with transaction-based conflict resolution to ensure consistent
 * state across multiple collaborators.
 *
 * Key responsibilities:
 * - Subscribe to board-specific WebSocket topic for real-time updates
 * - Handle board metadata updates (name, member changes, access permissions)
 * - Process drawing operations (add, update, delete canvas objects) from other users
 * - Manage chat message broadcasting and state synchronization
 * - Filter out own actions to prevent duplicate UI updates
 * - Implement transaction-based conflict resolution for optimistic updates
 * - Handle permission-based access loss and error scenarios
 *
 * @param props - Configuration object containing board ID, session info, and state management callbacks
 * @returns Object containing message handler for external access if needed
 */
export const useWebSocketHandler = ({
  boardId,
  sessionInstanceId,
  setBoardName,
  setAccessLost,
  setObjects,
  setMessages,
  commitDrawingTransaction,
  commitChatTransaction,
}: WebSocketHandlerProps) => {
  const { userEmail } = useAuth();

  // Handle board-level updates like member changes and board details modifications
  const handleBoardUpdate = useCallback(
    (update: BoardUpdateDTO) => {
      // Ignore updates from current user to prevent redundant operations
      if (update.sourceUserEmail === userEmail || !userEmail) {
        return;
      }

      if (update.updateType === 'MEMBERS_UPDATED') {
        // Refresh messages and board details when membership changes
        void boardService.getBoardMessages(boardId).then(setMessages);
        boardService
          .getBoardDetails(boardId)
          .then((details) => setBoardName(details.name))
          .catch((err) => {
            // Handle case where user lost access due to member removal
            if (err instanceof AxiosError && err.response?.status === 403) {
              // 403 Forbidden - user no longer has board access
              setAccessLost(true);
            }
          });
      } else if (update.updateType === 'DETAILS_UPDATED') {
        // Refresh board name when details are modified
        boardService
          .getBoardDetails(boardId)
          .then((details) => setBoardName(details.name))
          .catch((err) => {
            logger.warn('Failed to refresh board name after details update:', err);
          });
      }
    },
    [boardId, userEmail, setBoardName, setAccessLost, setMessages],
  );

  // Handle canvas drawing operations from other users
  const handleDrawingMessage = useCallback(
    (action: BoardActionResponse) => {
      // Check if this is our own action to prevent duplicate updates
      const isOwnDrawingAction =
        action.sender === sessionInstanceId &&
        (action.type === ActionType.OBJECT_ADD || action.type === ActionType.OBJECT_UPDATE);

      // Only apply remote actions to prevent duplicate UI updates
      if (!isOwnDrawingAction) {
        const actionPayload = { ...action.payload, instanceId: action.instanceId } as ActionPayload;

        if (action.type === ActionType.OBJECT_ADD) {
          setObjects((prev) => [...prev, actionPayload]);
        } else if (action.type === ActionType.OBJECT_UPDATE) {
          setObjects((prev) =>
            prev.map((obj) => (obj.instanceId === action.instanceId ? actionPayload : obj)),
          );
        } else if (action.type === ActionType.OBJECT_DELETE) {
          setObjects((prev) => prev.filter((obj) => obj.instanceId !== action.instanceId));
        }
      }

      // Always commit transaction for conflict resolution
      commitDrawingTransaction(action.instanceId);
    },
    [sessionInstanceId, setObjects, commitDrawingTransaction],
  );

  // Handle incoming chat messages from other users
  const handleChatMessage = useCallback(
    (chatMessage: ChatMessageResponse) => {
      setMessages((prevMessages) => {
        return [...prevMessages, chatMessage];
      });

      // Commit transaction if message has instance ID for optimistic update resolution
      if (chatMessage.instanceId) {
        commitChatTransaction(chatMessage.instanceId);
      }
    },
    [setMessages, commitChatTransaction],
  );

  // Main message router that dispatches incoming WebSocket messages to appropriate handlers
  const onMessageReceived = useCallback(
    (payload: unknown) => {
      if (typeof payload !== 'object' || !payload) {
        return;
      }

      // Complex message routing logic: discriminate between different WebSocket message types
      // using duck typing to avoid strict type checking on dynamic payloads from different sources

      // Check for board update messages (member/details changes)
      if (
        'updateType' in (payload as Record<string, unknown>) &&
        'sourceUserEmail' in (payload as Record<string, unknown>)
      ) {
        handleBoardUpdate(payload as BoardUpdateDTO);
        return;
      }

      // Check for transactional messages (drawing actions and chat)
      if (
        'type' in (payload as Record<string, unknown>) &&
        'instanceId' in (payload as Record<string, unknown>)
      ) {
        const transactionalMessage = payload as {
          type: string;
          instanceId: string;
          sender?: string;
          payload?: object;
        };

        // Route drawing actions to canvas object handler
        if (
          transactionalMessage.type === ActionType.OBJECT_ADD ||
          transactionalMessage.type === ActionType.OBJECT_UPDATE ||
          transactionalMessage.type === ActionType.OBJECT_DELETE
        ) {
          handleDrawingMessage(transactionalMessage as BoardActionResponse);
        } else if (transactionalMessage.type === 'CHAT') {
          // Route chat messages to message handler
          handleChatMessage(transactionalMessage as ChatMessageResponse);
        } else {
          logger.warn(`Unknown transactional message type: ${transactionalMessage.type}`);
        }
        return;
      }

      // Log unrecognized message formats for debugging
      logger.warn('Received unknown WebSocket message format:', payload);
    },
    [handleBoardUpdate, handleDrawingMessage, handleChatMessage],
  );

  useSocketSubscription(
    boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '',
    onMessageReceived,
    'board-websocket',
  );

  return {
    onMessageReceived,
  };
};
