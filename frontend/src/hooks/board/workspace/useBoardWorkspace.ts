import { APP_ROUTES, WEBSOCKET_CONFIG, WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from 'constants';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/Logger';

import { useAuth } from 'hooks/auth';
import { useBoardActions } from 'hooks/board/workspace/useBoardActions';
import { useBoardDataManager } from 'hooks/board/workspace/useBoardDataManager';
import { useUnifiedWebSocketHandler } from 'hooks/common/useUnifiedWebSocketHandler';
import { useSocket } from 'hooks/common';
import { WebSocketService } from 'services';
import { useSocketSubscription } from 'hooks/common/useSocket';
import type { ActionPayload, EnhancedActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { UserUpdateDTO } from 'types/WebSocketTypes';


export const useBoardWorkspace = (boardId: number) => {
  const navigate = useNavigate();
  const sessionInstanceId = useRef(Date.now().toString());
  const { userEmail } = useAuth();
  const { t } = useTranslation();

  const {
    isLoading,
    boardName,
    accessLost,
    objects,
    messages,
    setBoardName,
    setAccessLost,
    setObjects,
    setMessages,
  } = useBoardDataManager(boardId);

  const { isUndoAvailable, isRedoAvailable, handleUndo, handleRedo, resetCounts, incrementUndo } =
        useBoardActions(boardId);

  const [hasInitialized, setHasInitialized] = useState(false);
    
  useEffect(() => {
    if (!isLoading && objects.length > 0 && !hasInitialized) {
      resetCounts(objects.length);
      setHasInitialized(true);
    }
  }, [isLoading, objects.length, resetCounts, hasInitialized]);

  const {} = useSocket();
  
  const handleCommitDrawingTransaction = useCallback((instanceId: string) => {
    // Update drawing transaction status to confirmed
    setObjects((prev) => prev.map((obj) => {
      const enhancedObj = obj as EnhancedActionPayload;
      return enhancedObj.instanceId === instanceId 
        ? { ...enhancedObj, transactionStatus: 'confirmed' as const }
        : obj;
    }));
    logger.debug(`Drawing confirmed: ${instanceId}`);
  }, [setObjects]);

  const handleCommitChatTransaction = useCallback((instanceId: string) => {
    // Chat transactions are handled by their own hook
    logger.debug(`Chat transaction committed via unified handler: ${instanceId}`);
  }, []);

  useUnifiedWebSocketHandler({
    boardId,
    sessionInstanceId: sessionInstanceId.current,
    setBoardName,
    setAccessLost,
    setObjects,
    setMessages,
    commitDrawingTransaction: handleCommitDrawingTransaction,
    commitChatTransaction: handleCommitChatTransaction,
  });

  const handleDrawAction = useCallback(
    async (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => {
      const instanceId = crypto.randomUUID();
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
        toast.error(t('errors.drawingTooLarge', 'Drawing is too large to be saved.'));
        return;
      }

      // Add optimistic update
      const newObject: EnhancedActionPayload = {
        ...(actionRequest.payload as ActionPayload),
        instanceId,
        transactionStatus: 'pending' as const,
      };
      setObjects((prev) => [...prev, newObject]);

      try {
        WebSocketService.sendMessage(WEBSOCKET_DESTINATIONS.DRAW_ACTION, actionRequest);
        incrementUndo();
        logger.debug(`Drawing action sent: ${instanceId}`);
      } catch (error) {
        logger.error('Failed to send drawing action:', error);
        // Remove optimistic update on failure
        setObjects((prev) => prev.filter((obj) => obj.instanceId !== instanceId));
        toast.error(t('errors.drawingFailed', 'Failed to save drawing. Please try again.'));
      }
    },
    [boardId, incrementUndo, setObjects, t],
  );

  useEffect(() => {
    if (accessLost) {
      logger.warn('[useBoardWorkspace] accessLost is true. Navigating to board list...');
      navigate(APP_ROUTES.BOARD_LIST);
    }
  }, [accessLost, navigate]);

  const handleUserUpdate = useCallback(
    (message: UserUpdateDTO) => {
      logger.debug(`[useBoardWorkspace] Received user update: ${message.updateType}.`);
            
      if (message.updateType === 'BOARD_LIST_CHANGED') {
        logger.debug('[useBoardWorkspace] Board list changed. Navigating to board list...');
        navigate(APP_ROUTES.BOARD_LIST);
      } else if (message.updateType === 'BOARD_DETAILS_CHANGED') {
        logger.debug('[useBoardWorkspace] Board details changed. Staying on current page.');
      }
    },
    [navigate],
  );

  useSocketSubscription(userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '', handleUserUpdate, 'user');

  const pendingDrawingActions = useMemo(() => {
    return objects.filter((obj) => {
      const enhancedObj = obj as EnhancedActionPayload;
      return enhancedObj.transactionStatus === 'pending';
    }).length;
  }, [objects]);

  return {
    isLoading,
    boardName,
    accessLost,
    objects,
    messages,
    setMessages,
    instanceId: sessionInstanceId.current,
    isUndoAvailable,
    isRedoAvailable,
    pendingDrawingActions,
    handleDrawAction,
    handleUndo,
    handleRedo,
  };
};