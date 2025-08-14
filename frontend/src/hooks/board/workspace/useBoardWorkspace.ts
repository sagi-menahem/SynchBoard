import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS, APP_ROUTES, WEBSOCKET_CONFIG } from 'constants';

import { useCallback, useEffect, useRef, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/Logger';

import { useAuth } from 'hooks/auth';
import { useBoardActions } from 'hooks/board/workspace/useBoardActions';
import { useBoardDataManager } from 'hooks/board/workspace/useBoardDataManager';
import { useBoardWebSocketHandler } from 'hooks/board/workspace/useBoardWebSocketHandler';
import { useSocketSubscription } from 'hooks/common/useSocket';
import websocketService from 'services/WebSocketService';
import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { UserUpdateDTO } from 'types/WebSocketTypes';


export const useBoardWorkspace = (boardId: number) => {
  const navigate = useNavigate();
  const sessionInstanceId = useRef(Date.now().toString());
  const { userEmail } = useAuth();
  const { t } = useTranslation();

  // Transactional State: Track actions that have been sent but not yet confirmed by the server
  // Each pending action is keyed by its instanceId for efficient lookup and removal
  const [pendingActions, setPendingActions] = useState<Map<string, ActionPayload>>(new Map());

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

  // Transactional Rollback: Create rollback function for connection failures
  const rollbackPendingActions = useCallback(() => {
    if (pendingActions.size === 0) {
      return; // No pending actions to rollback
    }

    logger.warn(`Rolling back ${pendingActions.size} unconfirmed drawing actions due to connection failure`);

    // Remove all pending actions from the objects state
    setObjects((prev) => {
      const pendingInstanceIds = new Set(pendingActions.keys());
      return prev.filter((obj) => !pendingInstanceIds.has(obj.instanceId));
    });

    // Clear the pending actions map
    setPendingActions(new Map());

    // Show user notification about the rollback
    toast.error(t('errors.drawingsRolledBack', 'Some drawings were not saved due to connection issues.'));
  }, [pendingActions, setObjects, setPendingActions, t]);

  // Register rollback function with WebSocket service for this board session
  useEffect(() => {
    // Register the rollback callback with the WebSocket service
    const unregisterRollback = websocketService.registerRollbackCallback(rollbackPendingActions);
        
    return () => {
      // Cleanup: unregister the rollback callback when component unmounts
      unregisterRollback();
    };
  }, [rollbackPendingActions]);

  useBoardWebSocketHandler({
    boardId,
    sessionInstanceId: sessionInstanceId.current,
    setBoardName,
    setAccessLost,
    setObjects,
    setMessages,
    setPendingActions,
  });

  const handleDrawAction = useCallback(
    (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => {
      // Generate unique ID for this drawing action (serves as transaction ID)
      const newInstanceId = crypto.randomUUID();
      const fullPayload = { ...action.payload, instanceId: newInstanceId } as ActionPayload;
      const actionToSend: SendBoardActionRequest = {
        ...action,
        boardId,
        instanceId: newInstanceId,
        sender: sessionInstanceId.current,
      };

      // Proactive Client-Side Validation (Prevention Layer)
      // Calculate the actual message size that will be sent over the network
      const messageSize = JSON.stringify(actionToSend).length;
      if (messageSize > WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE) {
        logger.error(`Drawing too large: ${messageSize} bytes exceeds limit of ${WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE} bytes`);
        toast.error(t('errors.drawingTooLarge', 'Drawing is too large to be saved.'));
        return; // Do not update state or send message
      }

      // Transactional State Management: Register action as pending before sending
      // This tracks the action as "in-flight" until server confirmation or rollback
      setPendingActions((prev) => new Map(prev).set(newInstanceId, fullPayload));
      logger.debug(`Registered pending action: ${newInstanceId}`);

      // Optimistic Update: Add to UI immediately for responsiveness
      setObjects((prev) => [...prev, fullPayload]);
      incrementUndo();

      // Send message to server (no try-catch needed - failure is handled asynchronously)
      websocketService.sendMessage(WEBSOCKET_DESTINATIONS.DRAW_ACTION, actionToSend);
    },
    [boardId, setObjects, incrementUndo, setPendingActions, t],
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
    instanceId: sessionInstanceId.current,
    isUndoAvailable,
    isRedoAvailable,
    handleDrawAction,
    handleUndo,
    handleRedo,
  };
};
