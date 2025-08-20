import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS, APP_ROUTES } from 'constants';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import { useBoardActions } from 'hooks/board/workspace/useBoardActions';
import { useBoardDataManager } from 'hooks/board/workspace/useBoardDataManager';
import { useBoardWebSocketHandler } from 'hooks/board/workspace/useBoardWebSocketHandler';
import { useSocketSubscription, useWebSocket } from 'hooks/common/useSocket';
import transactionService from 'services/transactionService';
import websocketService from 'services/websocketService';
import type { SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { UserUpdateDTO } from 'types/WebSocketTypes';


export const useBoardWorkspace = (boardId: number) => {
  const navigate = useNavigate();
  const sessionInstanceId = useRef(Date.now().toString());
  const { userEmail } = useAuth();
  const { t } = useTranslation();
  const { isSocketConnected, connectionState } = useWebSocket();

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

  const { 
    isUndoAvailable, 
    isRedoAvailable, 
    handleUndo, 
    handleRedo, 
    resetCounts, 
    incrementUndo, 
  } = useBoardActions(boardId);

  const [hasInitialized, setHasInitialized] = useState(false);
    
  useEffect(() => {
    if (!isLoading && objects.length > 0 && !hasInitialized) {
      resetCounts(objects.length);
      setHasInitialized(true);
    }
  }, [isLoading, objects.length, resetCounts, hasInitialized]);

  // COMPLETE CENTRALIZATION: Use ONLY centralized transaction service
  // No more local hook transaction state - everything goes through the singleton
  
  // Success callback for centralized service
  const handleDrawingSuccess = useCallback((actionRequest: SendBoardActionRequest, transactionId: string) => {
    logger.debug(`[DRAWING] 🏭 CENTRALIZED success for transaction: ${transactionId}`);
    
    // Update drawing status to confirmed
    setObjects((prev) => prev.map((obj) => {
      if (obj.transactionId === transactionId) {
        return { ...obj, transactionStatus: 'confirmed' };
      }
      return obj;
    }));
  }, [
    setObjects,
  ]);

  // Failure callback for centralized service
  const handleDrawingFailure = useCallback((
    error: Error, 
    actionRequest: SendBoardActionRequest, 
    transactionId: string,
  ) => {
    logger.error(`[DRAWING] 🏭 CENTRALIZED failure for transaction: ${transactionId}`, error);
    
    if (error.message === 'Payload validation failed') {
      toast.error(t('errors.drawingTooLarge', 'Drawing is too large to be saved.'));
    } else {
      toast.error(t('errors.drawingFailed', 'Failed to save drawing. Please try again.'));
    }
    
    // Update drawing status to failed
    setObjects((prev) => prev.map((obj) => {
      if (obj.transactionId === transactionId) {
        return { ...obj, transactionStatus: 'failed' };
      }
      return obj;
    }));
  }, [setObjects, t]);

  // WebSocket handler for receiving messages (centralized service handles commits)
  useBoardWebSocketHandler({
    boardId,
    sessionInstanceId: sessionInstanceId.current,
    setBoardName,
    setAccessLost,
    setObjects,
    setMessages,
  });

  const handleDrawAction = useCallback(
    async (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => {
      const transactionId = crypto.randomUUID();
      
      // Create the full action request with board ID and session info
      const actionRequest: SendBoardActionRequest = {
        ...action,
        boardId,
        instanceId: transactionId,
        sender: sessionInstanceId.current,
      };

      logger.debug(`[DRAWING] 🏭 Using CENTRALIZED service for transaction: ${transactionId}`);
      logger.debug(`[DRAWING] 🏭 Connection status: ${connectionState}, connected: ${isSocketConnected}`);
      logger.debug(`[DRAWING] 🏭 Sending to destination: ${WEBSOCKET_DESTINATIONS.DRAW_ACTION}`);
      logger.debug('[DRAWING] 🏭 Action request:', actionRequest);

      // Check connection before sending
      if (!isSocketConnected) {
        const error = new Error('WebSocket not connected');
        logger.error(`[DRAWING] 🏭 Cannot send - WebSocket not connected. Status: ${connectionState}`);
        handleDrawingFailure(error, actionRequest, transactionId);
        throw error;
      }

      try {
        // Create transaction in centralized service
        transactionService.createTransaction(
          transactionId, 
          actionRequest, 
          10000, 
          handleDrawingSuccess, 
          handleDrawingFailure,
        );
        
        // Send action via WebSocket
        logger.debug('[DRAWING] 🏭 About to send WebSocket message...');
        await websocketService.sendMessage(WEBSOCKET_DESTINATIONS.DRAW_ACTION, actionRequest);
        logger.debug('[DRAWING] 🏭 WebSocket message sent successfully');
        
        // Increment undo count for successful actions
        incrementUndo();
        
        logger.debug(`[DRAWING] 🏭 Action sent successfully with centralized transaction: ${transactionId}`);
        return transactionId;
      } catch (error) {
        logger.error('[DRAWING] Failed to send drawing action:', error);
        handleDrawingFailure(error as Error, actionRequest, transactionId);
        throw error;
      }
    },
    [boardId, incrementUndo, handleDrawingSuccess, handleDrawingFailure, isSocketConnected, connectionState],
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
      // Update transaction status for pending objects using centralized service
      if (obj.transactionId && transactionService.isPending(obj.transactionId)) {
        const currentStatus = transactionService.getTransactionStatus(obj.transactionId);
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
  }, [objects]);

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
    pendingDrawingActions: transactionService.getPendingCount(),
    handleDrawAction,
    handleUndo,
    handleRedo,
  };
};