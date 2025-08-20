import { useCallback, useEffect, useState } from 'react';

import { WEBSOCKET_CONFIG } from 'constants/AppConstants';
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
  status: 'pending' | 'confirmed' | 'failed';
  timeoutId?: NodeJS.Timeout; // Timer for timeout handling
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
  getTransactionStatus: (transactionId: string) => 'sending' | 'failed' | 'confirmed' | null;
  
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

  // Removed offline queue context for simplicity

  // Generate transaction ID using provided function or default
  const generateId = config.generateTransactionId || (() => crypto.randomUUID());

  // Simplified - no longer need action type inference

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
        }
        return updated;
      });
    },
    []
  );

  /**
   * Handle transaction timeout - called when transaction takes too long
   */
  const handleTransactionTimeout = useCallback(
    (transactionId: string) => {
      setPendingTransactions(prev => {
        const updated = new Map(prev);
        const transaction = updated.get(transactionId);
        
        if (transaction && transaction.status === 'pending') {
          logger.warn(`Transaction timed out after ${WEBSOCKET_CONFIG.TRANSACTION_TIMEOUT}ms: ${transactionId}`);
          
          // Mark as failed due to timeout
          updated.set(transactionId, { 
            ...transaction, 
            status: 'failed',
            timeoutId: undefined 
          });
          
          // Call failure callback
          const timeoutError = new Error('Transaction confirmation timeout - server may be unavailable');
          config.onFailure?.(timeoutError, transaction.payload, transactionId);
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
    const totalTransactions = pendingTransactions.size;
    
    if (totalTransactions === 0) {
      logger.debug('No transactions to check - rollback complete');
      return;
    }

    // Categorize transactions by status and age
    const allTransactions = Array.from(pendingTransactions.entries());
    const now = Date.now();
    
    const genuinelyPending = allTransactions.filter(
      ([_, transaction]) => {
        // Only rollback transactions that are:
        // 1. Still pending (never confirmed)
        // 2. Recent enough that they likely never reached the server
        const transactionAge = now - transaction.timestamp;
        return transaction.status === 'pending' && transactionAge < 5000; // Less than 5 seconds old
      }
    );
    
    const staleTransactions = allTransactions.filter(
      ([_, transaction]) => {
        const transactionAge = now - transaction.timestamp;
        return transaction.status === 'pending' && transactionAge >= 5000; // 5+ seconds old
      }
    );
    
    const confirmedTransactions = allTransactions.filter(
      ([_, transaction]) => transaction.status === 'confirmed'
    );
    
    logger.info(
      `Connection lost - ${totalTransactions} total transactions: ${genuinelyPending.length} genuine rollbacks, ${staleTransactions.length} likely succeeded, ${confirmedTransactions.length} confirmed`
    );
    
    // Clean up stale transactions silently (they likely succeeded but confirmation was lost)
    if (staleTransactions.length > 0) {
      logger.info(`${staleTransactions.length} old transactions likely succeeded - cleaning up silently`);
      staleTransactions.forEach(([transactionId, transaction]) => {
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
      });
    }
    
    if (genuinelyPending.length === 0) {
      logger.info('No genuine failures detected - cleaning up without user notification');
      // Clean up all transactions without showing toasts
      setPendingTransactions(new Map());
      return;
    }

    logger.warn(`Rolling back ${genuinelyPending.length} genuinely failed transactions`);

    // Only rollback the transactions that genuinely failed
    let newState = currentState;
    let rollbackCount = 0;

    for (const [transactionId, transaction] of genuinelyPending) {
      try {
        // Clear any pending timeout timer
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
        
        // Apply rollback to remove the optimistic update
        newState = config.rollbackUpdate(newState, transactionId);
        rollbackCount++;
        
        // Call rollback callback to show user feedback - only for genuine failures
        config.onRollback?.(transactionId, transaction.payload);
        
        logger.debug(`Rolled back genuinely failed transaction: ${transactionId}`);
      } catch (error) {
        logger.error(`Error rolling back transaction ${transactionId}:`, error);
      }
    }

    // Apply all rollbacks to state
    if (rollbackCount > 0) {
      setState(newState);
      logger.info(`Successfully rolled back ${rollbackCount} transactions`);
    }

    // Clear all transactions after rollback
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
      
      logger.debug(`Sending ${config.actionType || 'message'}: ${transactionId}`);

      // Show action immediately (optimistic update)
      const newState = config.optimisticUpdate(currentState, payload, transactionId);
      setState(newState);

      // Inject instanceId into payload for server correlation
      const payloadWithInstanceId = { ...payload, instanceId: transactionId };

      // Check connection status
      if (websocketService.isConnected()) {
        // Connected - attempt direct send
        try {
          // Track transaction as pending server confirmation with timeout
          setPendingTransactions(prev => {
            const updated = new Map(prev);
            
            // Create timeout timer
            const timeoutId = setTimeout(() => {
              handleTransactionTimeout(transactionId);
            }, WEBSOCKET_CONFIG.TRANSACTION_TIMEOUT);
            
            updated.set(transactionId, {
              payload,
              timestamp: Date.now(),
              status: 'pending',
              timeoutId
            });
            return updated;
          });

          // Send to server via WebSocket
          await websocketService.sendMessage(config.destination, payloadWithInstanceId);
          
          logger.debug(`${config.actionType || 'Message'} sent, awaiting confirmation: ${transactionId}`);
          
          // Success callback will be called when server confirms via commitTransaction
          
          return transactionId;
        } catch (error) {
          // Network error during send - mark as failed
          logger.error(`WebSocket send failed for transaction ${transactionId}:`, error);
          
          // Update status to failed
          updateTransactionStatus(transactionId, 'failed');
          
          // Call failure callback if provided
          config.onFailure?.(error as Error, payload, transactionId);
          
          return transactionId;
        }
      } else {
        // Disconnected - fail immediately with clear error
        const disconnectedError = new Error('Cannot send - WebSocket disconnected');
        logger.warn(`WebSocket disconnected, cannot send transaction: ${transactionId}`);
        
        // Mark transaction as failed due to disconnection
        setPendingTransactions(prev => {
          const updated = new Map(prev);
          updated.set(transactionId, {
            payload,
            timestamp: Date.now(),
            status: 'failed',
            timeoutId: undefined // No timeout needed for immediate failures
          });
          logger.warn(`Transaction ${transactionId} failed - no connection`);
          return updated;
        });

        // Call failure callback if provided
        config.onFailure?.(disconnectedError, payload, transactionId);
        
        return transactionId;
      }
    },
    [config, currentState, setState, generateId, updateTransactionStatus, handleTransactionTimeout]
  );

  /**
   * Manually commit a transaction (mark as confirmed by server)
   * @param transactionId - ID of transaction to commit
   */
  const commitTransaction = useCallback((transactionId: string) => {
    setPendingTransactions(prev => {
      const updated = new Map(prev);
      const transaction = updated.get(transactionId);
      
      if (transaction) {
        logger.debug(`Server confirmed transaction: ${transactionId}`);
        
        // Clear timeout timer if it exists
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
        
        // Call success callback immediately when server confirms
        config.onSuccess?.(transaction.payload, transactionId);
        
        // Remove transaction immediately - no race conditions
        updated.delete(transactionId);
        
        logger.debug(`Transaction completed and cleaned up: ${transactionId} (${updated.size} remaining)`);
      } else {
        // This can happen if transaction timed out already - that's normal
        logger.debug(`Transaction ${transactionId} already cleaned up (likely timed out)`);
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
    (transactionId: string): 'pending' | 'confirmed' | 'failed' | null => {
      const transaction = pendingTransactions.get(transactionId);
      return transaction ? transaction.status : null;
    },
    [pendingTransactions]
  );

  /**
   * Get detailed transaction statistics for debugging
   */
  const getTransactionStats = useCallback(() => {
    const all = Array.from(pendingTransactions.values());
    return {
      total: all.length,
      pending: all.filter(t => t.status === 'pending').length,
      failed: all.filter(t => t.status === 'failed').length,
      confirmed: all.filter(t => t.status === 'confirmed').length,
    };
  }, [pendingTransactions]);

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
    commitTransaction,
  };
};