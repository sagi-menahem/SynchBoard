import { useCallback, useEffect, useState, useRef, useMemo } from 'react';

import logger from 'utils/logger';

import websocketService from 'services/websocketService';

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
  
  /** Optional callback when rollback occurs - receives all rolled back transactions */
  onRollback?: (rolledBackTransactions: { id: string; payload: TPayload }[]) => void;
  
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
  status: 'sending' | 'processing' | 'failed' | 'confirmed';
  timeoutId?: number;
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
  getTransactionStatus: (transactionId: string) => 'sending' | 'processing' | 'failed' | 'confirmed' | null;
  
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
 * A simplified React hook that provides transactional WebSocket messaging with optimistic updates
 * and automatic 10-second timeout handling.
 * 
 * Simplified transaction flow:
 * 1. sending → message is being sent to server
 * 2. processing → message sent successfully, waiting for confirmation
 * 3. confirmed → server confirmed receipt (success)
 * 4. failed → either send failed or 10-second timeout occurred
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
  setState: React.Dispatch<React.SetStateAction<TState>>,
): TransactionHookResult<TPayload> => {
  // CRITICAL FIX: Use useRef to persist transactions across re-renders
  // This prevents race conditions where transactions are lost during React re-renders
  const transactionsMapRef = useRef<Map<string, PendingTransaction<TPayload>>>(new Map());
  
  // State to trigger re-renders when transactions change
  const [transactionVersion, setTransactionVersion] = useState(0);
  
  // DEBUGGING: Add instance tracking to detect multiple instances
  const instanceId = useMemo(() => {
    const id = Math.random().toString(36).substr(2, 9);
    logger.debug(`[TRANSACTION] 🆔 Hook instance created: ${id}`);
    return id;
  }, []);
  
  // Helper to get current transactions
  const getTransactions = useCallback(() => transactionsMapRef.current, []);
  
  // Helper to update transactions and trigger re-render
  const updateTransactions = useCallback((updater: (map: Map<string, PendingTransaction<TPayload>>) => void) => {
    updater(transactionsMapRef.current);
    setTransactionVersion((v) => v + 1); // Trigger re-render
  }, []);

  // Cleanup ref for failed transactions to prevent memory leaks
  const cleanupIntervalRef = useRef<number | null>(null);

  // Generate transaction ID using provided function or default
  const generateId = useMemo(
    () => config.generateTransactionId || (() => crypto.randomUUID()),
    [config.generateTransactionId],
  );

  /**
   * Clean up old failed transactions to prevent memory leaks
   */
  const cleanupOldTransactions = useCallback(() => {
    const now = Date.now();
    const CLEANUP_THRESHOLD = 60000; // 60 seconds
    
    let removedCount = 0;
    const transactions = getTransactions();
    
    for (const [id, transaction] of transactions.entries()) {
      // Remove failed transactions older than 60 seconds
      if (transaction.status === 'failed' && now - transaction.timestamp > CLEANUP_THRESHOLD) {
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
        transactions.delete(id);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      logger.debug(`Cleaned up ${removedCount} old failed transactions`);
      setTransactionVersion((v) => v + 1); // Trigger re-render if we cleaned anything
    }
  }, [getTransactions]);

  // Set up periodic cleanup of old transactions
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(cleanupOldTransactions, 30000); // Clean every 30 seconds
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [cleanupOldTransactions]);

  /**
   * Handle transaction timeout - mark as failed after 10 seconds
   */
  const handleTransactionTimeout = useCallback(
    (transactionId: string) => {
      logger.debug(`[TRANSACTION] ⏰ Timeout triggered for: ${transactionId}`);
      
      const transactions = getTransactions();
      const transaction = transactions.get(transactionId);
      
      // Only process timeout if transaction exists and is still processing
      if (transaction && transaction.status === 'processing') {
        logger.warn(`[TRANSACTION] ❌ Transaction ${transactionId} timed out after 10 seconds - this indicates a real failure`);
        
        // Clear the timeout ID and mark as failed
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
        
        updateTransactions((map) => {
          map.set(transactionId, { 
            ...transaction, 
            status: 'failed',
            timeoutId: undefined, 
          });
        });
        
        // Call failure callback with timeout error
        const timeoutError = new Error('Transaction timed out after 10 seconds');
        config.onFailure?.(timeoutError, transaction.payload, transactionId);
        
        logger.debug(`[TRANSACTION] Transaction ${transactionId} marked as failed due to legitimate timeout`);
      } else if (!transaction) {
        // Transaction was already committed/deleted - this should be the normal case now
        logger.debug(`[TRANSACTION] ✅ Timeout fired but transaction ${transactionId} was already successfully committed - no error needed`);
      } else {
        // Transaction exists but not in processing state
        logger.debug(`[TRANSACTION] Timeout fired but transaction ${transactionId} has status ${transaction.status} - no timeout needed`);
      }
    },
    [config, getTransactions, updateTransactions],
  );

  /**
   * Rollback function that removes all pending transactions from state
   * This is called automatically on WebSocket disconnection
   */
  const rollbackPendingTransactions = useCallback(() => {
    const transactions = getTransactions();
    if (transactions.size === 0) {
      return; // No pending transactions to rollback
    }

    logger.warn(
      `Rolling back ${transactions.size} unconfirmed transactions due to connection failure`,
    );

    // Apply rollback for each pending transaction in reverse order (LIFO)
    const transactionIds = Array.from(transactions.keys()).reverse();
    let newState = currentState;
    const rolledBackTransactions: { id: string; payload: TPayload }[] = [];

    for (const transactionId of transactionIds) {
      const transaction = transactions.get(transactionId);
      if (transaction && (transaction.status === 'sending' || transaction.status === 'processing')) {
        // Rollback sending and processing transactions
        newState = config.rollbackUpdate(newState, transactionId);
        rolledBackTransactions.push({ id: transactionId, payload: transaction.payload });
        
        // Clear any timeout
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
      }
    }

    // Call rollback callback once with all rolled back transactions
    if (rolledBackTransactions.length > 0) {
      config.onRollback?.(rolledBackTransactions);
    }

    // Update state once with all rollbacks applied
    setState(newState);

    // Clear all transactions
    transactionsMapRef.current.clear();
    setTransactionVersion((v) => v + 1);
  }, [currentState, setState, config, getTransactions]);

  // Use refs to prevent stale closures in callbacks
  const rollbackCallbackRef = useRef(rollbackPendingTransactions);
  rollbackCallbackRef.current = rollbackPendingTransactions;

  /**
   * Register rollback callback with WebSocket service
   * This ensures rollback is triggered on connection failures
   */
  useEffect(() => {
    // Wrapper that always calls current rollback function from ref
    const rollbackWrapper = () => {
      logger.debug('Rollback triggered via ref wrapper');
      rollbackCallbackRef.current();
    };
    
    const unregisterRollback = websocketService.registerRollbackCallback(rollbackWrapper);
    
    return () => {
      unregisterRollback();
    };
  }, []); // Empty dependencies - register once with wrapper

  /**
   * Send a transactional WebSocket message with optimistic update and timeout handling
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
      
      logger.debug(`[TRANSACTION] Instance ${instanceId} starting new transaction: ${transactionId}`);
      logger.debug('[TRANSACTION] Payload:', JSON.stringify(payload, null, 2));

      // Apply optimistic update immediately
      const newState = config.optimisticUpdate(currentState, payload, transactionId);
      setState(newState);
      logger.debug(`[TRANSACTION] Applied optimistic update for: ${transactionId}`);

      // Inject instanceId into payload for server correlation
      const payloadWithInstanceId = { ...payload, instanceId: transactionId };

      // Check connection status
      if (!websocketService.isConnected()) {
        // No connection - mark as failed immediately
        const error = new Error('WebSocket not connected');
        logger.error(`Transaction ${transactionId} failed: not connected`);
        
        updateTransactions((map) => {
          map.set(transactionId, {
            payload,
            timestamp: Date.now(),
            status: 'failed',
          });
        });
        
        config.onFailure?.(error, payload, transactionId);
        throw error;
      }

      try {
        // Track as sending transaction
        updateTransactions((map) => {
          map.set(transactionId, {
            payload,
            timestamp: Date.now(),
            status: 'sending',
          });
        });

        logger.debug(`Sending message to server. Destination: ${config.destination}, Payload:`, JSON.stringify(payloadWithInstanceId, null, 2));
        
        // Send WebSocket message
        await websocketService.sendMessage(config.destination, payloadWithInstanceId);
        
        logger.debug(`[TRANSACTION] WebSocket message sent successfully: ${transactionId}`);
        
        // Set up 10-second timeout
        const timeoutId = setTimeout(() => {
          logger.debug(`[TRANSACTION] Timeout triggered for: ${transactionId}`);
          handleTransactionTimeout(transactionId);
        }, 10000);
        
        logger.debug(`[TRANSACTION] Set 10-second timeout for: ${transactionId} (timeoutId: ${timeoutId})`);
        
        // Mark as processing with timeout
        updateTransactions((map) => {
          const transaction = map.get(transactionId);
          if (transaction) {
            map.set(transactionId, { 
              ...transaction, 
              status: 'processing',
              timeoutId, 
            });
            logger.debug(`[TRANSACTION] Updated status to 'processing' for: ${transactionId}`);
          }
        });
        
        return transactionId;
      } catch (error) {
        // Send failed - mark as failed
        logger.error(`WebSocket send failed for transaction ${transactionId}:`, error);
        
        updateTransactions((map) => {
          const transaction = map.get(transactionId);
          if (transaction) {
            map.set(transactionId, { ...transaction, status: 'failed' });
          }
        });
        
        config.onFailure?.(error as Error, payload, transactionId);
        throw error;
      }
    },
    [config, currentState, setState, generateId, handleTransactionTimeout, updateTransactions],
  );

  /**
   * Manually commit a transaction (mark as confirmed by server)
   * @param transactionId - ID of transaction to commit
   */
  const commitTransaction = useCallback((transactionId: string) => {
    logger.debug(`[TRANSACTION] Instance ${instanceId} attempting to commit transaction: ${transactionId}`);
    
    const transactions = getTransactions();
    logger.debug(`[TRANSACTION] Instance ${instanceId} has ${transactions.size} transactions: [${Array.from(transactions.keys()).join(', ')}]`);
    const transaction = transactions.get(transactionId);
    
    if (transaction) {
      logger.debug(`[TRANSACTION] Found transaction ${transactionId} with status: ${transaction.status} and timeoutId: ${transaction.timeoutId}`);
      
      // CRITICAL: Clear timeout immediately to prevent false errors
      if (transaction.timeoutId) {
        logger.debug(`[TRANSACTION] Instance ${instanceId} ✅ CANCELLING timeout ${transaction.timeoutId} for successful transaction: ${transactionId}`);
        clearTimeout(transaction.timeoutId);
      } else {
        logger.debug(`[TRANSACTION] No timeout to cancel for transaction: ${transactionId}`);
      }
      
      // Call onSuccess if we haven't called it before (avoid double calls)
      if (transaction.status !== 'confirmed') {
        logger.debug(`[TRANSACTION] Calling onSuccess for transaction: ${transactionId}`);
        config.onSuccess?.(transaction.payload, transactionId);
      }
      
      // Remove the transaction (mark as committed)
      updateTransactions((map) => {
        map.delete(transactionId);
      });
      logger.debug(`[TRANSACTION] Instance ${instanceId} ✅ Successfully committed and removed transaction: ${transactionId}`);
    } else {
      // This is now expected if transaction was already committed - not an error
      logger.debug(`[TRANSACTION] Instance ${instanceId} - Transaction ${transactionId} not found - likely already committed by different instance`);
    }
  }, [config, getTransactions, updateTransactions]);

  /**
   * Check if a specific transaction is pending
   * @param transactionId - Transaction ID to check
   * @returns True if transaction is pending
   */
  const isPending = useCallback(
    (transactionId: string): boolean => {
      return getTransactions().has(transactionId);
    },
    [getTransactions],
  );

  /**
   * Get transaction status
   * @param transactionId - Transaction ID to check
   * @returns Transaction status or null if not found
   */
  const getTransactionStatus = useCallback(
    (transactionId: string): 'sending' | 'processing' | 'failed' | 'confirmed' | null => {
      const transaction = getTransactions().get(transactionId);
      return transaction ? transaction.status : null;
    },
    [getTransactions],
  );

  /**
   * Manually rollback all pending transactions
   * Useful for cleanup or manual error handling
   */
  const rollbackAll = useCallback(() => {
    rollbackPendingTransactions();
  }, [rollbackPendingTransactions]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts when component unmounts
      const transactions = getTransactions();
      transactions.forEach((transaction) => {
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
      });
    };
  }, [getTransactions]);

  return {
    sendTransactionalAction,
    isPending,
    getTransactionStatus,
    pendingCount: getTransactions().size,
    pendingTransactionIds: Array.from(getTransactions().keys()),
    rollbackAll,
    commitTransaction,
    // Include transactionVersion to force re-renders when transactions change
    _version: transactionVersion,
  };
};