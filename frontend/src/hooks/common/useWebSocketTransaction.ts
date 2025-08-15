import { useCallback, useEffect, useState } from 'react';

import logger from 'utils/Logger';
import websocketService from 'services/WebSocketService';

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
}

/**
 * Interface for tracking pending transactions
 * @template TPayload - The type of data being sent
 */
interface PendingTransaction<TPayload> {
  payload: TPayload;
  timestamp: number;
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
 * A reusable React hook that provides transactional WebSocket messaging with optimistic updates
 * and automatic rollback on connection failures.
 * 
 * This hook manages the complete lifecycle of WebSocket transactions:
 * 1. Applies optimistic updates to UI state immediately
 * 2. Tracks pending transactions until server confirmation
 * 3. Automatically rolls back unconfirmed transactions on connection failure
 * 4. Provides commit mechanism when server confirmation is received
 * 
 * @template TPayload - Type of the payload being sent via WebSocket
 * @template TState - Type of the state being managed optimistically
 * 
 * @param config - Configuration object defining transaction behavior
 * @param currentState - Current state value
 * @param setState - State setter function
 * @returns Object with transaction management functions
 * 
 * @example
 * ```typescript
 * // For drawing actions
 * const { sendTransactionalAction, pendingCount } = useWebSocketTransaction({
 *   destination: '/app/board.drawAction',
 *   optimisticUpdate: (objects, newDrawing, id) => [...objects, { ...newDrawing, instanceId: id }],
 *   rollbackUpdate: (objects, id) => objects.filter(obj => obj.instanceId !== id),
 *   onFailure: (error) => toast.error('Drawing failed to save')
 * }, objects, setObjects);
 * 
 * // Usage
 * await sendTransactionalAction(drawingData);
 * ```
 */
export const useWebSocketTransaction = <TPayload extends object, TState>(
  config: TransactionConfig<TPayload, TState>,
  currentState: TState,
  setState: React.Dispatch<React.SetStateAction<TState>>
): TransactionHookResult<TPayload> => {
  // Track pending transactions with their payloads
  const [pendingTransactions, setPendingTransactions] = useState<
    Map<string, PendingTransaction<TPayload>>
  >(new Map());

  // Generate transaction ID using provided function or default
  const generateId = config.generateTransactionId || (() => crypto.randomUUID());

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
      if (transaction) {
        newState = config.rollbackUpdate(newState, transactionId);
        
        // Call rollback callback if provided
        config.onRollback?.(transactionId, transaction.payload);
      }
    }

    // Update state once with all rollbacks applied
    setState(newState);

    // Clear all pending transactions
    setPendingTransactions(new Map());
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
   * Send a transactional WebSocket message with optimistic update
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

      // Track pending transaction
      setPendingTransactions(prev => new Map(prev).set(transactionId, {
        payload,
        timestamp: Date.now()
      }));

      try {
        // Inject instanceId into payload for server correlation
        const payloadWithInstanceId = { ...payload, instanceId: transactionId };
        
        // DIAGNOSTIC LOG: Full payload being sent to server
        logger.debug(`[DIAGNOSTIC] Sending chat message to server. Destination: ${config.destination}, Payload:`, JSON.stringify(payloadWithInstanceId, null, 2));
        
        // Send WebSocket message
        await websocketService.sendMessage(config.destination, payloadWithInstanceId);
        
        logger.debug(`WebSocket message sent successfully: ${transactionId}`);
        
        // Call success callback if provided
        config.onSuccess?.(payload, transactionId);
        
        return transactionId;
      } catch (error) {
        // On immediate send failure, rollback this specific transaction
        logger.error(`WebSocket send failed for transaction ${transactionId}:`, error);
        
        // Remove from pending transactions
        setPendingTransactions(prev => {
          const updated = new Map(prev);
          updated.delete(transactionId);
          return updated;
        });

        // Rollback this specific transaction
        const rolledBackState = config.rollbackUpdate(currentState, transactionId);
        setState(rolledBackState);

        // Call failure callback if provided
        config.onFailure?.(error as Error, payload, transactionId);
        
        throw error;
      }
    },
    [config, currentState, setState, generateId]
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
   * Manually rollback all pending transactions
   * Useful for cleanup or manual error handling
   */
  const rollbackAll = useCallback(() => {
    rollbackPendingTransactions();
  }, [rollbackPendingTransactions]);

  return {
    sendTransactionalAction,
    isPending,
    pendingCount: pendingTransactions.size,
    pendingTransactionIds: Array.from(pendingTransactions.keys()),
    rollbackAll,
    commitTransaction,
  };
};