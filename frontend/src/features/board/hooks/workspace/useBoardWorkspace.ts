import { useAuth } from 'features/auth/hooks';
import { useBoardActions } from 'features/board/hooks/workspace/useBoardActions';
import { useBoardDataManager } from 'features/board/hooks/workspace/useBoardDataManager';
import type {
  ActionPayload,
  EnhancedActionPayload,
  SendBoardActionRequest,
} from 'features/board/types/BoardObjectTypes';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import { useWebSocketHandler } from 'features/websocket/hooks/useWebSocketHandler';
import type { BoardUpdateDTO, UserUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  APP_ROUTES,
  WEBSOCKET_CONFIG,
  WEBSOCKET_DESTINATIONS,
  WEBSOCKET_TOPICS,
} from 'shared/constants';
import logger from 'shared/utils/logger';

// Lazy-load websocket service to reduce initial bundle size
const getWebSocketService = async () => {
  const module = await import('features/websocket/services/websocketService');
  return module.default;
};

/**
 * Custom hook that orchestrates the complete board workspace functionality including real-time collaboration.
 * This hook serves as the central coordinator for board workspace operations, combining data management,
 * WebSocket communication, optimistic updates, action history, and transaction handling. It manages the
 * complex state synchronization between local optimistic actions and server confirmations, handles drawing
 * action submissions with size validation, and coordinates chat and drawing transaction commits. The hook
 * integrates multiple WebSocket subscriptions for real-time collaboration and provides comprehensive error
 * handling and access control management for collaborative whiteboard sessions.
 *
 * @param boardId - ID of the board workspace to manage and coordinate operations for
 * @returns Object containing workspace state, drawing objects with optimistic updates, action handlers,
 *   undo/redo functionality, pending transaction counts, and chat transaction management
 */
export const useBoardWorkspace = (boardId: number) => {
  const navigate = useNavigate();
  const sessionInstanceId = useRef(Date.now().toString());
  const { userEmail } = useAuth();
  const { t } = useTranslation(['board', 'common']);
  const chatCommitHandlerRef = useRef<((instanceId: string) => void) | null>(null);

  const {
    isLoading,
    boardName,
    boardDetails,
    accessLost,
    objects: baseObjects,
    messages,
    setBoardName,
    setAccessLost,
    setObjects: setBaseObjects,
    setMessages,
    fetchInitialData,
  } = useBoardDataManager(boardId);

  const [optimisticObjects, addOptimisticObject] = useOptimistic(
    baseObjects,
    (state, newObject: ActionPayload) => [...state, newObject],
  );

  const { isUndoAvailable, isRedoAvailable, handleUndo, handleRedo, resetCounts, incrementUndo } =
    useBoardActions(boardId);

  const [hasInitialized, setHasInitialized] = useState(false);

  // Initializes undo/redo counts when board data loads for the first time
  useEffect(() => {
    if (!isLoading && baseObjects.length > 0 && !hasInitialized) {
      resetCounts(baseObjects.length);
      setHasInitialized(true);
    }
  }, [isLoading, baseObjects.length, resetCounts, hasInitialized]);

  const handleCommitDrawingTransaction = useCallback(
    (instanceId: string) => {
      // Convert pending optimistic actions to confirmed state to prevent duplicate rendering
      setBaseObjects((prev) =>
        prev.map((obj) => {
          const enhancedObj = obj as EnhancedActionPayload;
          return enhancedObj.instanceId === instanceId
            ? { ...enhancedObj, transactionStatus: 'confirmed' as const }
            : obj;
        }),
      );
    },
    [setBaseObjects],
  );

  const handleCommitChatTransaction = useCallback((instanceId: string) => {
    if (chatCommitHandlerRef.current) {
      chatCommitHandlerRef.current(instanceId);
    } else {
      logger.warn('No chat commit handler registered');
    }
  }, []);

  const registerChatCommitHandler = useCallback(
    (handler: ((instanceId: string) => void) | null) => {
      chatCommitHandlerRef.current = handler;
    },
    [],
  );

  useWebSocketHandler({
    boardId,
    sessionInstanceId: sessionInstanceId.current,
    setBoardName,
    setAccessLost,
    setObjects: setBaseObjects,
    setMessages,
    commitDrawingTransaction: handleCommitDrawingTransaction,
    commitChatTransaction: handleCommitChatTransaction,
  });

  const handleDrawAction = useCallback(
    async (
      action:
        | Omit<SendBoardActionRequest, 'boardId'>
        | Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>,
    ) => {
      const instanceId = 'instanceId' in action ? action.instanceId : crypto.randomUUID();
      const actionRequest: SendBoardActionRequest = {
        ...action,
        boardId,
        instanceId,
        sender: sessionInstanceId.current,
      };

      const messageSize = JSON.stringify(actionRequest).length;
      if (messageSize > WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE) {
        logger.error(
          `Drawing too large: ${messageSize} bytes exceeds limit of ${WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE} bytes`,
        );
        toast.error(t('board:errors.drawingTooLarge'));
        return;
      }

      const optimisticObject: EnhancedActionPayload = {
        ...(actionRequest.payload as ActionPayload),
        instanceId,
        transactionStatus: 'pending' as const,
      };

      startTransition(() => {
        addOptimisticObject(optimisticObject);
      });

      try {
        const service = await getWebSocketService();
        service.sendMessage(WEBSOCKET_DESTINATIONS.DRAW_ACTION, actionRequest);
        incrementUndo();
      } catch (error) {
        logger.error('Failed to send drawing action:', error);
        toast.error(t('board:errors.drawingFailed'));
        throw error;
      }
    },
    [boardId, incrementUndo, addOptimisticObject, t],
  );

  // Handles access loss by redirecting to board list
  useEffect(() => {
    if (accessLost) {
      logger.warn('[useBoardWorkspace] accessLost is true. Navigating to board list...');
      void navigate(APP_ROUTES.BOARD_LIST);
    }
  }, [accessLost, navigate]);

  const handleUserUpdate = useCallback(
    (message: UserUpdateDTO) => {
      if (message.updateType === 'BOARD_LIST_CHANGED') {
        void navigate(APP_ROUTES.BOARD_LIST);
      } else if (message.updateType === 'BOARD_DETAILS_CHANGED') {
      }
    },
    [navigate],
  );

  useSocketSubscription(
    userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '',
    handleUserUpdate,
    'user',
  );

  const handleBoardUpdate = useCallback(
    (message: BoardUpdateDTO) => {
      if (message.updateType === 'CANVAS_UPDATED') {
        fetchInitialData();
      }
    },
    [fetchInitialData],
  );

  useSocketSubscription(WEBSOCKET_TOPICS.BOARD(boardId), handleBoardUpdate, 'board');

  const pendingDrawingActions = useMemo(() => {
    return optimisticObjects.filter((obj) => {
      const enhancedObj = obj as EnhancedActionPayload;
      return enhancedObj.transactionStatus === 'pending';
    }).length;
  }, [optimisticObjects]);

  return {
    isLoading,
    boardName,
    boardDetails,
    accessLost,
    objects: optimisticObjects,
    messages,
    instanceId: sessionInstanceId.current,
    isUndoAvailable,
    isRedoAvailable,
    pendingDrawingActions,
    handleDrawAction,
    handleUndo,
    handleRedo,
    registerChatCommitHandler,
  };
};
