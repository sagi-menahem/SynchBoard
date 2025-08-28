
import { startTransition, useCallback, useEffect, useMemo, useOptimistic, useRef, useState } from 'react';

import { useAuth } from 'features/auth/hooks';
import { useBoardActions } from 'features/board/hooks/workspace/useBoardActions';
import { useBoardDataManager } from 'features/board/hooks/workspace/useBoardDataManager';
import type { ActionPayload, EnhancedActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import WebSocketService from 'features/websocket/services/websocketService';
import type { BoardUpdateDTO, UserUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES, WEBSOCKET_CONFIG, WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from 'shared/constants';
import { useSocket, useSocketSubscription } from 'shared/hooks/useSocket';
import { useWebSocketHandler } from 'shared/hooks/useWebSocketHandler';
import logger from 'shared/utils/logger';

export const useBoardWorkspace = (boardId: number) => {
  const navigate = useNavigate();
  const sessionInstanceId = useRef(Date.now().toString());
  const { userEmail } = useAuth();
  const { t } = useTranslation(['board', 'common']);

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

  useEffect(() => {
    if (!isLoading && baseObjects.length > 0 && !hasInitialized) {
      resetCounts(baseObjects.length);
      setHasInitialized(true);
    }
  }, [isLoading, baseObjects.length, resetCounts, hasInitialized]);

  const { } = useSocket();

  const handleCommitDrawingTransaction = useCallback((instanceId: string) => {
    setBaseObjects((prev) => prev.map((obj) => {
      const enhancedObj = obj as EnhancedActionPayload;
      return enhancedObj.instanceId === instanceId
        ? { ...enhancedObj, transactionStatus: 'confirmed' as const }
        : obj;
    }));
  }, [setBaseObjects]);

  const handleCommitChatTransaction = useCallback((_instanceId: string) => {
    // Chat transactions are handled by their own hook
  }, []);

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
    async (action: Omit<SendBoardActionRequest, 'boardId'> | Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => {
      // Use existing instanceId for updates, generate new one for adds
      const instanceId = 'instanceId' in action ? action.instanceId : crypto.randomUUID();
      const actionRequest: SendBoardActionRequest = {
        ...action,
        boardId,
        instanceId,
        sender: sessionInstanceId.current,
      };

      // Validate payload size
      const messageSize = JSON.stringify(actionRequest).length;
      if (messageSize > WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE) {
        logger.error(
          `Drawing too large: ${messageSize} bytes exceeds limit of ${WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE} bytes`,
        );
        toast.error(t('board:errors.drawingTooLarge'));
        return;
      }

      // Create optimistic object
      const optimisticObject: EnhancedActionPayload = {
        ...(actionRequest.payload as ActionPayload),
        instanceId,
        transactionStatus: 'pending' as const,
      };

      // Add optimistic update in transition - will automatically rollback on error
      startTransition(() => {
        addOptimisticObject(optimisticObject);
      });

      try {
        WebSocketService.sendMessage(WEBSOCKET_DESTINATIONS.DRAW_ACTION, actionRequest);
        incrementUndo();
      } catch (error) {
        logger.error('Failed to send drawing action:', error);
        toast.error(t('board:errors.drawingFailed'));
        // No need to manually remove optimistic update - useOptimistic handles rollback
        throw error; // Re-throw to trigger automatic rollback
      }
    },
    [boardId, incrementUndo, addOptimisticObject, t],
  );

  useEffect(() => {
    if (accessLost) {
      logger.warn('[useBoardWorkspace] accessLost is true. Navigating to board list...');
      navigate(APP_ROUTES.BOARD_LIST);
    }
  }, [accessLost, navigate]);

  const handleUserUpdate = useCallback(
    (message: UserUpdateDTO) => {
      if (message.updateType === 'BOARD_LIST_CHANGED') {
        navigate(APP_ROUTES.BOARD_LIST);
      } else if (message.updateType === 'BOARD_DETAILS_CHANGED') {
      }
    },
    [navigate],
  );

  useSocketSubscription(userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '', handleUserUpdate, 'user');

  const handleBoardUpdate = useCallback(
    (message: BoardUpdateDTO) => {
      if (message.updateType === 'CANVAS_UPDATED') {
        // Refresh board details to get updated canvas settings
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
    objects: optimisticObjects, // Return optimistic objects for real-time UI
    messages,
    instanceId: sessionInstanceId.current,
    isUndoAvailable,
    isRedoAvailable,
    pendingDrawingActions,
    handleDrawAction,
    handleUndo,
    handleRedo,
  };
};