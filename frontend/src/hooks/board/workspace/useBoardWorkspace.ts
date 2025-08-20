import { APP_ROUTES, WEBSOCKET_CONFIG, WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from 'constants';

import { useCallback, useEffect, useRef, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/Logger';

import { useAuth } from 'hooks/auth';
import { useBoardActions } from 'hooks/board/workspace/useBoardActions';
import { useBoardDataManager } from 'hooks/board/workspace/useBoardDataManager';
import { useBoardWebSocketHandler } from 'hooks/board/workspace/useBoardWebSocketHandler';
import { useWebSocketTransaction } from 'hooks/common';
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

  const { sendTransactionalAction, commitTransaction, pendingCount } = useWebSocketTransaction<
    SendBoardActionRequest,
    ActionPayload[]
  >({
    destination: WEBSOCKET_DESTINATIONS.DRAW_ACTION,
    optimisticUpdate: (currentObjects, actionRequest, transactionId) => {
      const newObject: EnhancedActionPayload = {
        ...(actionRequest.payload as ActionPayload),
        instanceId: transactionId,
        transactionId,
        transactionStatus: 'pending' as const,
      };
      return [...currentObjects, newObject];
    },
    rollbackUpdate: (currentObjects, transactionId) => {
      return currentObjects.filter((obj) => obj.instanceId !== transactionId);
    },
    validatePayload: (actionRequest) => {
      const messageSize = JSON.stringify(actionRequest).length;
      if (messageSize > WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE) {
        logger.error(
          `Drawing too large: ${messageSize} bytes exceeds limit of ${WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE} bytes`,
        );
        return false;
      }
      return true;
    },
    onSuccess: (_, transactionId) => {
      logger.debug(`Drawing confirmed: ${transactionId}`);
      setObjects((prev) => prev.map((obj) => {
        const enhancedObj = obj as EnhancedActionPayload;
        return enhancedObj.transactionId === transactionId 
          ? { ...enhancedObj, transactionStatus: 'confirmed' as const }
          : obj;
      }));
    },
    onFailure: (error, _, transactionId) => {
      if (error.message === 'Payload validation failed') {
        toast.error(t('errors.drawingTooLarge', 'Drawing is too large to be saved.'));
      } else {
        toast.error(t('errors.drawingFailed', 'Failed to save drawing. Please try again.'));
      }
      logger.error(`Drawing action failed: ${transactionId}`, error);
      setObjects((prev) => prev.map((obj) => {
        const enhancedObj = obj as EnhancedActionPayload;
        return enhancedObj.transactionId === transactionId 
          ? { ...enhancedObj, transactionStatus: 'failed' as const }
          : obj;
      }));
    },
    onRollback: (transactionId, actionRequest) => {
      const toolName = actionRequest.payload?.tool || 'drawing';
      logger.warn(`Drawing failed to save: ${toolName}`);
      toast.error(`Failed to save ${toolName}`, {
        duration: 4000,
        id: `drawing-rollback-${transactionId}`,
      });
    },
  }, objects, setObjects);

  const handleCommitTransaction = useCallback((instanceId: string) => {
    commitTransaction(instanceId);
  }, [commitTransaction]);

  useBoardWebSocketHandler({
    boardId,
    sessionInstanceId: sessionInstanceId.current,
    setBoardName,
    setAccessLost,
    setObjects,
    setMessages,
    commitTransaction: handleCommitTransaction,
  });

  const handleDrawAction = useCallback(
    async (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => {
      const actionRequest: SendBoardActionRequest = {
        ...action,
        boardId,
        instanceId: '',
        sender: sessionInstanceId.current,
      };

      try {
        const transactionId = await sendTransactionalAction(actionRequest);
        actionRequest.instanceId = transactionId;
        incrementUndo();
        
        logger.debug(`Drawing action sent: ${transactionId}`);
      } catch (error) {
        logger.error('Failed to send drawing action:', error);
      }
    },
    [boardId, sendTransactionalAction, incrementUndo],
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
    pendingDrawingActions: pendingCount,
    handleDrawAction,
    handleUndo,
    handleRedo,
  };
};