import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';

import toast from 'react-hot-toast';
import logger from 'utils/Logger';
import websocketService from 'services/WebSocketService';
import type { OfflineQueueState, OfflineQueueContextValue, QueuedAction } from 'types/OfflineQueueTypes';

// Configuration constants
const MAX_QUEUE_SIZE = 100; // Maximum number of queued actions to prevent memory issues

// Initial state
const initialState: OfflineQueueState = {
  queuedActions: [],
  isProcessingQueue: false,
  processingStats: {
    total: 0,
    processed: 0,
    failed: 0,
  },
  lastProcessedAt: null,
};

// Action types for reducer
type QueueAction =
  | { type: 'ADD_ACTION'; payload: QueuedAction }
  | { type: 'REMOVE_ACTION'; payload: string }
  | { type: 'UPDATE_ACTION'; payload: { id: string; updates: Partial<QueuedAction> } }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'UPDATE_STATS'; payload: Partial<OfflineQueueState['processingStats']> }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'SET_LAST_PROCESSED'; payload: number };

// Reducer function
const queueReducer = (state: OfflineQueueState, action: QueueAction): OfflineQueueState => {
  switch (action.type) {
    case 'ADD_ACTION':
      console.log(`[QUEUE ANALYSIS] ADD_ACTION: ${action.payload.id}, type: ${action.payload.type}, queue size before: ${state.queuedActions.length}, queue size after: ${state.queuedActions.length + 1}`);
      return {
        ...state,
        queuedActions: [...state.queuedActions, { ...action.payload, retryCount: 0 }],
      };
    
    case 'REMOVE_ACTION':
      console.log(`[QUEUE ANALYSIS] REMOVE_ACTION: ${action.payload}, queue size before: ${state.queuedActions.length}, queue size after: ${state.queuedActions.length - 1}`);
      return {
        ...state,
        queuedActions: state.queuedActions.filter(queuedAction => queuedAction.id !== action.payload),
      };
    
    case 'UPDATE_ACTION':
      return {
        ...state,
        queuedActions: state.queuedActions.map(queuedAction =>
          queuedAction.id === action.payload.id
            ? { ...queuedAction, ...action.payload.updates }
            : queuedAction
        ),
      };
    
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessingQueue: action.payload,
      };
    
    case 'UPDATE_STATS':
      return {
        ...state,
        processingStats: { ...state.processingStats, ...action.payload },
      };
    
    case 'CLEAR_QUEUE':
      console.log(`[QUEUE ANALYSIS] CLEAR_QUEUE: Clearing ${state.queuedActions.length} queued actions`);
      return {
        ...state,
        queuedActions: [],
        processingStats: { total: 0, processed: 0, failed: 0 },
      };
    
    case 'SET_LAST_PROCESSED':
      return {
        ...state,
        lastProcessedAt: action.payload,
      };
    
    default:
      return state;
  }
};

// Context
const OfflineQueueContext = createContext<OfflineQueueContextValue | null>(null);

// Provider component
interface OfflineQueueProviderProps {
  children: React.ReactNode;
}

export const OfflineQueueProvider: React.FC<OfflineQueueProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(queueReducer, initialState);
  const lastWarningTimeRef = useRef<number>(0);

  // Sleep utility for rate limiting
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Queue action handler with overflow protection
  const queueAction = useCallback((action: Omit<QueuedAction, 'retryCount'>) => {
    // Check if queue has reached maximum size
    if (state.queuedActions.length >= MAX_QUEUE_SIZE) {
      // Remove oldest action to make room for new one (FIFO overflow handling)
      const oldestAction = state.queuedActions.reduce((oldest, current) => 
        current.timestamp < oldest.timestamp ? current : oldest
      );
      
      logger.warn(`Queue size limit (${MAX_QUEUE_SIZE}) reached. Removing oldest action: ${oldestAction.id}`);
      dispatch({ type: 'REMOVE_ACTION', payload: oldestAction.id });
      
      // Notify user about queue overflow (throttled to avoid spam)
      const now = Date.now();
      if (now - lastWarningTimeRef.current > 10000) { // 10 second throttle
        toast(`⚠️ Queue is full (${MAX_QUEUE_SIZE} actions). Older actions are being discarded.`, {
          icon: '⚠️',
          style: { background: '#fef3c7', color: '#92400e' }
        });
        lastWarningTimeRef.current = now;
      }
    }
    
    logger.debug(`Queuing action: ${action.type} - ${action.id} (Queue size: ${state.queuedActions.length}/${MAX_QUEUE_SIZE})`);
    dispatch({ type: 'ADD_ACTION', payload: action as QueuedAction });
  }, [state.queuedActions]);

  // Remove action from queue
  const removeAction = useCallback((actionId: string) => {
    dispatch({ type: 'REMOVE_ACTION', payload: actionId });
  }, []);

  // Clear entire queue
  const clearQueue = useCallback(() => {
    logger.debug('Clearing entire action queue');
    dispatch({ type: 'CLEAR_QUEUE' });
  }, []);

  // Get queue position for an action
  const getQueuePosition = useCallback((actionId: string): number => {
    const sortedActions = [...state.queuedActions].sort((a, b) => a.timestamp - b.timestamp);
    return sortedActions.findIndex(action => action.id === actionId) + 1;
  }, [state.queuedActions]);

  // Retry failed actions (reset retry count and try again)
  const retryFailedActions = useCallback(() => {
    logger.debug('Retrying failed actions');
    state.queuedActions.forEach(action => {
      if (action.retryCount >= action.maxRetries) {
        dispatch({
          type: 'UPDATE_ACTION',
          payload: { id: action.id, updates: { retryCount: 0 } }
        });
      }
    });
  }, [state.queuedActions]);

  // Get queue capacity information
  const getQueueCapacity = useCallback(() => {
    return {
      current: state.queuedActions.length,
      maximum: MAX_QUEUE_SIZE,
      available: MAX_QUEUE_SIZE - state.queuedActions.length,
      utilizationPercent: Math.round((state.queuedActions.length / MAX_QUEUE_SIZE) * 100)
    };
  }, [state.queuedActions.length]);

  // Main queue processor
  const processQueue = useCallback(async (): Promise<void> => {
    console.log(`[QUEUE ANALYSIS] processQueue called: isProcessing=${state.isProcessingQueue}, queueSize=${state.queuedActions.length}, connected=${websocketService.isConnected()}`);
    
    if (state.isProcessingQueue || state.queuedActions.length === 0) {
      console.log(`[QUEUE ANALYSIS] processQueue early return: isProcessing=${state.isProcessingQueue}, queueSize=${state.queuedActions.length}`);
      return;
    }

    console.log(`[QUEUE ANALYSIS] Starting queue processing with ${state.queuedActions.length} actions`);
    logger.info(`Processing queue with ${state.queuedActions.length} actions`);
    dispatch({ type: 'SET_PROCESSING', payload: true });

    // Sort actions by timestamp (FIFO)
    const actionsToProcess = [...state.queuedActions].sort((a, b) => a.timestamp - b.timestamp);
    
    // Initialize stats
    dispatch({
      type: 'UPDATE_STATS',
      payload: { total: actionsToProcess.length, processed: 0, failed: 0 }
    });

    for (const action of actionsToProcess) {
      try {
        // Check if still connected before attempting to send
        if (!websocketService.isConnected()) {
          logger.warn('Connection lost during queue processing, stopping');
          break;
        }

        logger.debug(`Processing queued action: ${action.id} (attempt ${action.retryCount + 1})`);

        // Send with timeout
        await Promise.race([
          websocketService.sendMessage(action.destination, action.payload),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Send timeout')), 10000)
          )
        ]);

        // Success - remove from queue and notify transaction system
        dispatch({ type: 'REMOVE_ACTION', payload: action.id });
        dispatch({
          type: 'UPDATE_STATS',
          payload: { processed: state.processingStats.processed + 1 }
        });

        // CRITICAL FIX: Bridge queue success to transaction system
        // This updates the transaction status from "queued" to "confirmed"
        websocketService.notifyTransactionSuccess(action.id);

        logger.debug(`Successfully processed queued action: ${action.id}`);

      } catch (error) {
        logger.error(`Failed to process queued action ${action.id}:`, error);

        // Increment retry count
        const newRetryCount = action.retryCount + 1;

        if (newRetryCount >= action.maxRetries) {
          // Max retries reached - remove from queue and mark as permanently failed
          dispatch({ type: 'REMOVE_ACTION', payload: action.id });
          dispatch({
            type: 'UPDATE_STATS',
            payload: { failed: state.processingStats.failed + 1 }
          });
          
          logger.warn(`Action ${action.id} permanently failed after ${action.maxRetries} attempts`);
        } else {
          // Update retry count for next attempt
          dispatch({
            type: 'UPDATE_ACTION',
            payload: {
              id: action.id,
              updates: { retryCount: newRetryCount }
            }
          });
        }
      }

      // Rate limiting between actions
      await sleep(200);
    }

    dispatch({ type: 'SET_PROCESSING', payload: false });
    dispatch({ type: 'SET_LAST_PROCESSED', payload: Date.now() });
    
    console.log(`[QUEUE ANALYSIS] Queue processing completed. Remaining queue size: ${state.queuedActions.length}`);
    logger.info('Queue processing completed');
  }, [state.queuedActions, state.isProcessingQueue, state.processingStats]);

  // CRITICAL FIX: Use ref to maintain current processQueue reference
  // This prevents stale closure issues when the callback is registered once
  // but needs to access changing state
  const processQueueRef = useRef<() => Promise<void>>(processQueue);
  processQueueRef.current = processQueue; // Always update to current version

  // Register queue processor with WebSocket service using ref wrapper
  useEffect(() => {
    console.log(`[QUEUE REGISTRATION FIX] Registering queue processor with WebSocketService`);
    
    // Wrapper function that calls the current processQueue from ref
    const wrapper = async () => {
      console.log(`[QUEUE REGISTRATION FIX] Queue processor wrapper triggered - current queue size: ${state.queuedActions.length}`);
      if (processQueueRef.current) {
        logger.debug('Queue processor triggered via ref wrapper');
        return await processQueueRef.current();
      }
      return Promise.resolve();
    };
    
    const unregister = websocketService.registerQueueProcessor(wrapper);
    console.log(`[QUEUE REGISTRATION FIX] Queue processor registered successfully`);
    
    return () => {
      console.log(`[QUEUE REGISTRATION FIX] Queue processor being unregistered`);
      unregister();
    };
  }, []); // Empty dependencies - register once with wrapper that always calls current

  // Context value
  const contextValue: OfflineQueueContextValue = {
    state,
    actions: {
      queueAction,
      removeAction,
      clearQueue,
      retryFailedActions,
      getQueuePosition,
      getQueueCapacity,
      processQueue,
    },
  };

  return (
    <OfflineQueueContext.Provider value={contextValue}>
      {children}
    </OfflineQueueContext.Provider>
  );
};

// Custom hook for consuming the context
export const useOfflineQueue = (): OfflineQueueContextValue => {
  const context = useContext(OfflineQueueContext);
  if (!context) {
    throw new Error('useOfflineQueue must be used within an OfflineQueueProvider');
  }
  return context;
};