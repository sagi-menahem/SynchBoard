import { useCallback, useEffect, useState, useRef } from 'react';

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
  // Track pending transactions with their payloads and status
  const [pendingTransactions, setPendingTransactions] = useState<
    Map<string, PendingTransaction<TPayload>>
  >(new Map());

  // Generate transaction ID using provided function or default
  const generateId = config.generateTransactionId || (() => crypto.randomUUID());

  /**
   * Update transaction status
   */
  const updateTransactionStatus = useCallback(
    (transactionId: string, status: PendingTransaction<TPayload>['status']) => {
      setPendingTransactions((prev) => {
        const updated = new Map(prev);
        const transaction = updated.get(transactionId);
        if (transaction) {
          updated.set(transactionId, { ...transaction, status });
          logger.debug(`Updated transaction ${transactionId} status to: ${status}`);
        }
        return updated;
      });
    },
    [],
  );

  /**
   * Handle transaction timeout - mark as failed after 10 seconds
   */
  const handleTransactionTimeout = useCallback(
    (transactionId: string) => {
      logger.warn(`Transaction ${transactionId} timed out after 10 seconds`);
      
      setPendingTransactions((prev) => {
        const updated = new Map(prev);
        const transaction = updated.get(transactionId);
        
        if (transaction && transaction.status === 'processing') {
          // Clear the timeout ID and mark as failed
          if (transaction.timeoutId) {
            clearTimeout(transaction.timeoutId);
          }
          
          updated.set(transactionId, { 
            ...transaction, 
            status: 'failed',
            timeoutId: undefined 
          });
          
          // Call failure callback with timeout error
          const timeoutError = new Error('Transaction timed out after 10 seconds');
          config.onFailure?.(timeoutError, transaction.payload, transactionId);
          
          logger.debug(`Transaction ${transactionId} marked as failed due to timeout`);
        }
        
        return updated;
      });
    },
    [config],
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
      `Rolling back ${pendingTransactions.size} unconfirmed transactions due to connection failure`,
    );

    // Apply rollback for each pending transaction in reverse order (LIFO)
    const transactionIds = Array.from(pendingTransactions.keys()).reverse();
    let newState = currentState;
    const rolledBackTransactions: { id: string; payload: any }[] = [];

    for (const transactionId of transactionIds) {
      const transaction = pendingTransactions.get(transactionId);
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
    setPendingTransactions(new Map());
  }, [pendingTransactions, currentState, setState, config]);

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
      
      logger.debug(`Starting WebSocket transaction: ${transactionId}`);

      // Apply optimistic update immediately
      const newState = config.optimisticUpdate(currentState, payload, transactionId);
      setState(newState);

      // Inject instanceId into payload for server correlation
      const payloadWithInstanceId = { ...payload, instanceId: transactionId };

      // Check connection status
      if (!websocketService.isConnected()) {
        // No connection - mark as failed immediately
        const error = new Error('WebSocket not connected');
        logger.error(`Transaction ${transactionId} failed: not connected`);
        
        setPendingTransactions((prev) => new Map(prev).set(transactionId, {
          payload,
          timestamp: Date.now(),
          status: 'failed',
        }));
        
        config.onFailure?.(error, payload, transactionId);
        throw error;
      }

      try {
        // Track as sending transaction
        setPendingTransactions((prev) => new Map(prev).set(transactionId, {
          payload,
          timestamp: Date.now(),
          status: 'sending',
        }));

        logger.debug(`Sending message to server. Destination: ${config.destination}, Payload:`, JSON.stringify(payloadWithInstanceId, null, 2));
        
        // Send WebSocket message
        await websocketService.sendMessage(config.destination, payloadWithInstanceId);
        
        logger.debug(`WebSocket message sent successfully: ${transactionId}`);
        
        // Set up 10-second timeout
        const timeoutId = setTimeout(() => {
          handleTransactionTimeout(transactionId);
        }, 10000);
        
        // Mark as processing with timeout
        setPendingTransactions((prev) => {
          const updated = new Map(prev);
          const transaction = updated.get(transactionId);
          if (transaction) {
            updated.set(transactionId, { 
              ...transaction, 
              status: 'processing',
              timeoutId 
            });
          }
          return updated;
        });
        
        return transactionId;
      } catch (error) {
        // Send failed - mark as failed
        logger.error(`WebSocket send failed for transaction ${transactionId}:`, error);
        
        setPendingTransactions((prev) => {
          const updated = new Map(prev);
          const transaction = updated.get(transactionId);
          if (transaction) {
            updated.set(transactionId, { ...transaction, status: 'failed' });
          }
          return updated;
        });
        
        config.onFailure?.(error as Error, payload, transactionId);
        throw error;
      }
    },
    [config, currentState, setState, generateId, updateTransactionStatus, handleTransactionTimeout],
  );

  /**
   * Manually commit a transaction (mark as confirmed by server)
   * @param transactionId - ID of transaction to commit
   */
  const commitTransaction = useCallback((transactionId: string) => {
    setPendingTransactions((prev) => {
      const updated = new Map(prev);
      const transaction = updated.get(transactionId);
      
      if (transaction) {
        // Clear any timeout
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
        
        // Remove the transaction (mark as committed)
        updated.delete(transactionId);
        logger.debug(`Committed and deleted transaction: ${transactionId}`);
        
        // Call onSuccess if we haven't called it before (avoid double calls)
        if (transaction.status !== 'confirmed') {
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
    [pendingTransactions],
  );

  /**
   * Get transaction status
   * @param transactionId - Transaction ID to check
   * @returns Transaction status or null if not found
   */
  const getTransactionStatus = useCallback(
    (transactionId: string): 'sending' | 'processing' | 'failed' | 'confirmed' | null => {
      const transaction = pendingTransactions.get(transactionId);
      return transaction ? transaction.status : null;
    },
    [pendingTransactions],
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
      pendingTransactions.forEach((transaction) => {
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
      });
    };
  }, [pendingTransactions]);

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