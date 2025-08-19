import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS, APP_ROUTES, WEBSOCKET_CONFIG } from 'constants';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import { useBoardActions } from 'hooks/board/workspace/useBoardActions';
import { useBoardDataManager } from 'hooks/board/workspace/useBoardDataManager';
import { useBoardWebSocketHandler } from 'hooks/board/workspace/useBoardWebSocketHandler';
import { useWebSocketTransaction } from 'hooks/common';
import { useSocketSubscription } from 'hooks/common/useSocket';
// import websocketService from 'services/websocketService'; // REMOVED: No longer needed in simple system
import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
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
    // fetchInitialData, // REMOVED: No longer used in simple system
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

  // Use the new transactional hook for drawing actions
  const { 
    sendTransactionalAction, 
    commitTransaction, 
    pendingCount,
    getTransactionStatus,
    isPending, 
  } = useWebSocketTransaction<
    SendBoardActionRequest,
    ActionPayload[]
  >({
    destination: WEBSOCKET_DESTINATIONS.DRAW_ACTION,
    optimisticUpdate: (currentObjects, actionRequest, transactionId) => {
      // Extract payload and add the transaction ID as instanceId with transaction status
      const newObject: ActionPayload = {
        ...actionRequest.payload,
        instanceId: transactionId,
        transactionId,
        transactionStatus: 'sending',
      } as ActionPayload;
      return [...currentObjects, newObject];
    },
    rollbackUpdate: (currentObjects, transactionId) => {
      return currentObjects.filter((obj) => obj.instanceId !== transactionId);
    },
    validatePayload: (actionRequest) => {
      // Validate message size
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
      logger.debug(`Drawing action confirmed: ${transactionId}`);
      
      // Update drawing status to confirmed
      setObjects((prev) => prev.map((obj) => {
        if (obj.transactionId === transactionId) {
          return { ...obj, transactionStatus: 'confirmed' };
        }
        return obj;
      }));
    },
    onFailure: (error, _, transactionId) => {
      if (error.message === 'Payload validation failed') {
        toast.error(t('errors.drawingTooLarge', 'Drawing is too large to be saved.'));
      } else {
        toast.error(t('errors.drawingFailed', 'Failed to save drawing. Please try again.'));
      }
      logger.error(`Drawing action failed: ${transactionId}`, error);
      
      // Update drawing status to failed
      setObjects((prev) => prev.map((obj) => {
        if (obj.transactionId === transactionId) {
          return { ...obj, transactionStatus: 'failed' };
        }
        return obj;
      }));
    },
    onRollback: (rolledBackTransactions: { id: string; payload: any }[]) => {
      const count = rolledBackTransactions.length;
      logger.warn(`${count} drawing actions rolled back due to connection failure`);
      
      if (count === 1) {
        toast.error(t('errors.drawingRolledBack', 'Drawing will be saved when reconnected.'));
      } else {
        toast.error(t('errors.drawingsRolledBack', `${count} drawings will be saved when reconnected.`));
      }
    },
  }, objects, setObjects);

  // WebSocket handler for processing incoming messages and committing transactions
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
      // Create the full action request with board ID and session info
      const actionRequest: SendBoardActionRequest = {
        ...action,
        boardId,
        instanceId: '', // Will be set by the transactional hook
        sender: sessionInstanceId.current,
      };

      try {
        // Send the action using the transactional hook
        const transactionId = await sendTransactionalAction(actionRequest);
        
        // Update the action request with the actual transaction ID for consistency
        actionRequest.instanceId = transactionId;
        
        // Increment undo count for successful actions
        incrementUndo();
        
        logger.debug(`Drawing action sent: ${transactionId}`);
      } catch (error) {
        // Error handling is already done by the transactional hook
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

  // REMOVED: Board state refresh callback registration (no longer exists in simplified system)
  // The new simple connection-based system doesn't refresh board state on reconnection

  // Enhanced objects with current transaction status for visual feedback
  const enhancedObjects = useMemo(() => {
    return objects.map((obj) => {
      // Update transaction status for pending objects
      if (obj.transactionId && isPending(obj.transactionId)) {
        const currentStatus = getTransactionStatus(obj.transactionId);
        return {
          ...obj,
          transactionStatus: currentStatus || 'confirmed',
        };
      }
      
      // Ensure confirmed status for server-originated objects
      if (!obj.transactionId) {
        return { ...obj, transactionStatus: 'confirmed' as const };
      }
      
      return obj;
    });
  }, [objects, isPending, getTransactionStatus]);

  return {
    isLoading,
    boardName,
    accessLost,
    objects: enhancedObjects, // Return enhanced objects with transaction status
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