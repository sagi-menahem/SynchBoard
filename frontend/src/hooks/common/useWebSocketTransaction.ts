import { useCallback, useEffect, useState } from 'react';

import logger from 'utils/Logger';
import websocketService from 'services/WebSocketService';
import { useOfflineQueue } from 'context/OfflineQueueContext';

/**
 * Configuration interface for setting up a WebSocket transaction
 * @template TPayload - The type of data being sent/received
 * @template TState - The type of the state being managed
 */
interface TransactionConfig<TPayload extends object, TState> {
  /** STOMP destination for sending messages */
  destination: string;
  
  /** Function to apply optimistic update to current state */
  optimisticUpdate: (currentState: TState, payload: TPayload, transactionId: string) => TState;
  
  /** Function to rollback a specific transaction from state */
  rollbackUpdate: (currentState: TState, transactionId: string) => TState;
  
  /** Optional validation function to check payload before sending */
  validatePayload?: (payload: TPayload) => boolean;
  
  /** Optional callback when transaction succeeds */
  onSuccess?: (payload: TPayload, transactionId: string) => void;
  
  /** Optional callback when transaction fails */
  onFailure?: (error: Error, payload: TPayload, transactionId: string) => void;
  
  /** Optional callback when rollback occurs */
  onRollback?: (transactionId: string, payload: TPayload) => void;
  
  /** Function to generate unique transaction IDs (defaults to crypto.randomUUID) */
  generateTransactionId?: () => string;
  
  /** Action type for queue classification */
  actionType?: 'CHAT' | 'DRAWING';
}

/**
 * Interface for tracking pending transactions
 * @template TPayload - The type of data being sent
 */
interface PendingTransaction<TPayload> {
  payload: TPayload;
  timestamp: number;
  status: 'pending' | 'queued' | 'processing' | 'failed' | 'confirmed';
}

/**
 * Return type for the useWebSocketTransaction hook
 * @template TPayload - The type of data being sent
 */
interface TransactionHookResult<TPayload> {
  /** Function to send a transactional WebSocket message */
  sendTransactionalAction: (payload: TPayload) => Promise<string>;
  
  /** Check if a specific transaction is pending */
  isPending: (transactionId: string) => boolean;
  
  /** Get transaction status */
  getTransactionStatus: (transactionId: string) => 'pending' | 'queued' | 'processing' | 'failed' | 'confirmed' | null;
  
  /** Get the number of pending transactions */
  pendingCount: number;
  
  /** Get all pending transaction IDs */
  pendingTransactionIds: string[];
  
  /** Manually rollback all pending transactions */
  rollbackAll: () => void;
  
  /** Manually commit a specific transaction (useful for external confirmations) */
  commitTransaction: (transactionId: string) => void;
}

/**
 * A reusable React hook that provides transactional WebSocket messaging with optimistic updates,
 * offline queueing, and automatic rollback on connection failures.
 * 
 * This hook manages the complete lifecycle of WebSocket transactions:
 * 1. Applies optimistic updates to UI state immediately
 * 2. Tracks pending transactions until server confirmation
 * 3. Queues actions when offline instead of failing immediately
 * 4. Automatically processes queued actions on reconnection
 * 5. Automatically rolls back unconfirmed transactions on connection failure
 * 6. Provides commit mechanism when server confirmation is received
 * 
 * @template TPayload - Type of the payload being sent via WebSocket
 * @template TState - Type of the state being managed optimistically
 * 
 * @param config - Configuration object defining transaction behavior
 * @param currentState - Current state value
 * @param setState - State setter function
 * @returns Object with transaction management functions
 */
export const useWebSocketTransaction = <TPayload extends object, TState>(
  config: TransactionConfig<TPayload, TState>,
  currentState: TState,
  setState: React.Dispatch<React.SetStateAction<TState>>
): TransactionHookResult<TPayload> => {
  // Track pending transactions with their payloads and status
  const [pendingTransactions, setPendingTransactions] = useState<
    Map<string, PendingTransaction<TPayload>>
  >(new Map());

  // Access offline queue context
  const { actions: queueActions } = useOfflineQueue();

  // Generate transaction ID using provided function or default
  const generateId = config.generateTransactionId || (() => crypto.randomUUID());

  // Infer action type from payload or use provided type
  const inferActionType = useCallback((payload: TPayload): 'CHAT' | 'DRAWING' => {
    if (config.actionType) {
      return config.actionType;
    }
    
    // Infer from payload properties
    if ('content' in payload && typeof payload.content === 'string') {
      return 'CHAT';
    }
    
    return 'DRAWING';
  }, [config.actionType]);

  /**
   * Update transaction status
   */
  const updateTransactionStatus = useCallback(
    (transactionId: string, status: PendingTransaction<TPayload>['status']) => {
      setPendingTransactions(prev => {
        const updated = new Map(prev);
        const transaction = updated.get(transactionId);
        if (transaction) {
          updated.set(transactionId, { ...transaction, status });
          logger.debug(`Updated transaction ${transactionId} status to: ${status}`);
        }
        return updated;
      });
    },
    []
  );

  /**
   * Handle transaction success callback from queue processor
   * This bridges the gap between offline queue and transaction state
   */
  const handleQueueSuccess = useCallback(
    (transactionId: string) => {
      logger.debug(`Queue success callback for transaction: ${transactionId}`);
      
      setPendingTransactions(prev => {
        const updated = new Map(prev);
        const transaction = updated.get(transactionId);
        
        if (transaction && transaction.status === 'queued') {
          // CRITICAL FIX: Update status from "queued" to "confirmed"
          // This removes the visual "queued" state from the UI
          updated.delete(transactionId);
          logger.debug(`Transaction ${transactionId} successfully confirmed via queue processor`);
          
          // Call success callback if provided
          config.onSuccess?.(transaction.payload, transactionId);
          
          return updated;
        } else if (transaction) {
          logger.debug(`Transaction ${transactionId} status is ${transaction.status}, not updating`);
        } else {
          logger.debug(`Transaction ${transactionId} not found in pending transactions`);
        }
        
        return updated;
      });
    },
    [config]
  );

  /**
   * Rollback function that removes all pending transactions from state
   * This is called automatically on WebSocket disconnection
   */
  const rollbackPendingTransactions = useCallback(() => {
    if (pendingTransactions.size === 0) {
      return; // No pending transactions to rollback
    }

    logger.warn(
      `Rolling back ${pendingTransactions.size} unconfirmed transactions due to connection failure`
    );

    // Apply rollback for each pending transaction in reverse order (LIFO)
    const transactionIds = Array.from(pendingTransactions.keys()).reverse();
    let newState = currentState;

    for (const transactionId of transactionIds) {
      const transaction = pendingTransactions.get(transactionId);
      if (transaction && transaction.status === 'pending') {
        // Only rollback pending transactions, not queued ones
        newState = config.rollbackUpdate(newState, transactionId);
        
        // Call rollback callback if provided
        config.onRollback?.(transactionId, transaction.payload);
      }
    }

    // Update state once with all rollbacks applied
    setState(newState);

    // Clear pending transactions but preserve queued ones
    setPendingTransactions(prev => {
      const updated = new Map();
      for (const [id, transaction] of prev.entries()) {
        if (transaction.status === 'queued') {
          updated.set(id, transaction);
        }
      }
      return updated;
    });
  }, [pendingTransactions, currentState, setState, config]);

  /**
   * Register rollback callback with WebSocket service
   * This ensures rollback is triggered on connection failures
   */
  useEffect(() => {
    const unregisterRollback = websocketService.registerRollbackCallback(rollbackPendingTransactions);
    
    return () => {
      unregisterRollback();
    };
  }, [rollbackPendingTransactions]);

  /**
   * Register transaction success callback with WebSocket service
   * This bridges queue success notifications to transaction state updates
   */
  useEffect(() => {
    const unregisterTransactionCallback = websocketService.registerTransactionSuccessCallback(handleQueueSuccess);
    
    return () => {
      unregisterTransactionCallback();
    };
  }, [handleQueueSuccess]);

  /**
   * Send a transactional WebSocket message with optimistic update and offline queueing
   * @param payload - Data to send via WebSocket
   * @returns Promise that resolves with the transaction ID
   */
  const sendTransactionalAction = useCallback(
    async (payload: TPayload): Promise<string> => {
      // Validate payload if validator is provided
      if (config.validatePayload && !config.validatePayload(payload)) {
        const error = new Error('Payload validation failed');
        logger.error('WebSocket transaction validation failed:', payload);
        throw error;
      }

      // Generate unique transaction ID
      const transactionId = generateId();
      
      logger.debug(`Starting WebSocket transaction: ${transactionId}`);

      // Apply optimistic update immediately
      const newState = config.optimisticUpdate(currentState, payload, transactionId);
      setState(newState);

      // Inject instanceId into payload for server correlation
      const payloadWithInstanceId = { ...payload, instanceId: transactionId };

      // Check connection status
      if (websocketService.isConnected()) {
        // Connected - attempt direct send
        try {
          // Track as pending transaction
          setPendingTransactions(prev => new Map(prev).set(transactionId, {
            payload,
            timestamp: Date.now(),
            status: 'pending'
          }));

          logger.debug(`[DIAGNOSTIC] Sending message to server. Destination: ${config.destination}, Payload:`, JSON.stringify(payloadWithInstanceId, null, 2));
          
          // Send WebSocket message
          await websocketService.sendMessage(config.destination, payloadWithInstanceId);
          
          logger.debug(`WebSocket message sent successfully: ${transactionId}`);
          
          // Call success callback if provided
          config.onSuccess?.(payload, transactionId);
          
          return transactionId;
        } catch (error) {
          // Network error during send - queue instead of rollback
          logger.warn(`WebSocket send failed for transaction ${transactionId}, queuing for retry:`, error);
          
          // Update status to queued
          updateTransactionStatus(transactionId, 'queued');
          
          // Add to offline queue
          queueActions.queueAction({
            id: transactionId,
            type: inferActionType(payload),
            destination: config.destination,
            payload: payloadWithInstanceId,
            timestamp: Date.now(),
            maxRetries: 3,
            priority: 'normal'
          });
          
          return transactionId;
        }
      } else {
        // Disconnected - queue immediately
        logger.debug(`WebSocket disconnected, queuing transaction: ${transactionId}`);
        
        // Track as queued transaction
        setPendingTransactions(prev => new Map(prev).set(transactionId, {
          payload,
          timestamp: Date.now(),
          status: 'queued'
        }));

        // Add to offline queue
        queueActions.queueAction({
          id: transactionId,
          type: inferActionType(payload),
          destination: config.destination,
          payload: payloadWithInstanceId,
          timestamp: Date.now(),
          maxRetries: 3,
          priority: 'normal'
        });
        
        return transactionId;
      }
    },
    [config, currentState, setState, generateId, inferActionType, queueActions, updateTransactionStatus]
  );

  /**
   * Manually commit a transaction (mark as confirmed by server)
   * @param transactionId - ID of transaction to commit
   */
  const commitTransaction = useCallback((transactionId: string) => {
    setPendingTransactions(prev => {
      const updated = new Map(prev);
      if (updated.has(transactionId)) {
        const transaction = updated.get(transactionId);
        updated.delete(transactionId);
        logger.debug(`Committed transaction: ${transactionId}`);
        
        // Call success callback if provided and transaction exists
        if (transaction) {
          config.onSuccess?.(transaction.payload, transactionId);
        }
      }
      return updated;
    });
  }, [config]);

  /**
   * Check if a specific transaction is pending
   * @param transactionId - Transaction ID to check
   * @returns True if transaction is pending
   */
  const isPending = useCallback(
    (transactionId: string): boolean => {
      return pendingTransactions.has(transactionId);
    },
    [pendingTransactions]
  );

  /**
   * Get transaction status
   * @param transactionId - Transaction ID to check
   * @returns Transaction status or null if not found
   */
  const getTransactionStatus = useCallback(
    (transactionId: string): 'pending' | 'queued' | 'processing' | 'failed' | 'confirmed' | null => {
      const transaction = pendingTransactions.get(transactionId);
      return transaction ? transaction.status : null;
    },
    [pendingTransactions]
  );

  /**
   * Manually rollback all pending transactions
   * Useful for cleanup or manual error handling
   */
  const rollbackAll = useCallback(() => {
    rollbackPendingTransactions();
  }, [rollbackPendingTransactions]);

  return {
    sendTransactionalAction,
    isPending,
    getTransactionStatus,
    pendingCount: pendingTransactions.size,
    pendingTransactionIds: Array.from(pendingTransactions.keys()),
    rollbackAll,
    commitTransaction,
  };
};