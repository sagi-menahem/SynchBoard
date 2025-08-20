import { useCallback, useEffect, useMemo, useState } from 'react';

import logger from 'utils/Logger';

import { WEBSOCKET_CONFIG } from 'constants/AppConstants';
import websocketService from 'services/WebSocketService';

interface TransactionConfig<TPayload extends object, TState> {
  destination: string;

  
  optimisticUpdate: (currentState: TState, payload: TPayload, transactionId: string) => TState;

  
  rollbackUpdate: (currentState: TState, transactionId: string) => TState;

  
  validatePayload?: (payload: TPayload) => boolean;

  
  onSuccess?: (payload: TPayload, transactionId: string) => void;

  
  onFailure?: (error: Error, payload: TPayload, transactionId: string) => void;

  
  onRollback?: (transactionId: string, payload: TPayload) => void;

  
  generateTransactionId?: () => string;

  
  actionType?: 'CHAT' | 'DRAWING';
}

interface PendingTransaction<TPayload> {
  payload: TPayload;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  timeoutId?: ReturnType<typeof setTimeout>;
}

interface TransactionHookResult<TPayload> {
  sendTransactionalAction: (payload: TPayload) => Promise<string>;

  
  isPending: (transactionId: string) => boolean;

  
  getTransactionStatus: (transactionId: string) => 'sending' | 'failed' | 'confirmed' | null;

  
  pendingCount: number;

  
  pendingTransactionIds: string[];

  
  rollbackAll: () => void;

  
  commitTransaction: (transactionId: string) => void;
}

export const useWebSocketTransaction = <TPayload extends object, TState>(
  config: TransactionConfig<TPayload, TState>,
  currentState: TState,
  setState: React.Dispatch<React.SetStateAction<TState>>,
): TransactionHookResult<TPayload> => {
  const [pendingTransactions, setPendingTransactions] = useState<
    Map<string, PendingTransaction<TPayload>>
  >(new Map());
  const generateId = useMemo(
    () => config.generateTransactionId || (() => crypto.randomUUID()),
    [config.generateTransactionId],
  );

  const updateTransactionStatus = useCallback(
    (transactionId: string, status: PendingTransaction<TPayload>['status']) => {
      setPendingTransactions((prev) => {
        const updated = new Map(prev);
        const transaction = updated.get(transactionId);
        if (transaction) {
          updated.set(transactionId, { ...transaction, status });
        }
        return updated;
      });
    },
    [],
  );

  const handleTransactionTimeout = useCallback(
    (transactionId: string) => {
      setPendingTransactions((prev) => {
        const updated = new Map(prev);
        const transaction = updated.get(transactionId);
        
        if (transaction && transaction.status === 'pending') {
          logger.warn(`Transaction timed out after ${WEBSOCKET_CONFIG.TRANSACTION_TIMEOUT}ms: ${transactionId}`);
          
          updated.set(transactionId, { 
            ...transaction, 
            status: 'failed',
            timeoutId: undefined, 
          });
          const timeoutError = new Error('Transaction confirmation timeout - server may be unavailable');
          config.onFailure?.(timeoutError, transaction.payload, transactionId);
        }
        
        return updated;
      });
    },
    [config],
  );

  const rollbackPendingTransactions = useCallback(() => {
    const totalTransactions = pendingTransactions.size;
    
    if (totalTransactions === 0) {
      logger.debug('No transactions to check - rollback complete');
      return;
    }

    const allTransactions = Array.from(pendingTransactions.entries());
    const now = Date.now();
    
    const genuinelyPending = allTransactions.filter(
      ([, transaction]) => {
        const transactionAge = now - transaction.timestamp;
        return transaction.status === 'pending' && transactionAge < 5000;
      },
    );
    
    const staleTransactions = allTransactions.filter(
      ([, transaction]) => {
        const transactionAge = now - transaction.timestamp;
        return transaction.status === 'pending' && transactionAge >= 5000;
      },
    );
    
    const confirmedTransactions = allTransactions.filter(
      ([, transaction]) => transaction.status === 'confirmed',
    );
    
    logger.info(
      `Connection lost - ${totalTransactions} total transactions: ${genuinelyPending.length} genuine rollbacks, ${staleTransactions.length} likely succeeded, ${confirmedTransactions.length} confirmed`,
    );
    
    if (staleTransactions.length > 0) {
      logger.info(`${staleTransactions.length} old transactions likely succeeded - cleaning up silently`);
      staleTransactions.forEach(([, transaction]) => {
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
      });
    }
    
    if (genuinelyPending.length === 0) {
      logger.info('No genuine failures detected - cleaning up without user notification');
      setPendingTransactions(new Map());
      return;
    }

    logger.warn(`Rolling back ${genuinelyPending.length} genuinely failed transactions`);

    let newState = currentState;
    let rollbackCount = 0;

    for (const [transactionId, transaction] of genuinelyPending) {
      try {
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
        newState = config.rollbackUpdate(newState, transactionId);
        rollbackCount++;
        config.onRollback?.(transactionId, transaction.payload);
        
        logger.debug(`Rolled back genuinely failed transaction: ${transactionId}`);
      } catch (error) {
        logger.error(`Error rolling back transaction ${transactionId}:`, error);
      }
    }

    if (rollbackCount > 0) {
      setState(newState);
      logger.info(`Successfully rolled back ${rollbackCount} transactions`);
    }

    setPendingTransactions(new Map());
  }, [pendingTransactions, currentState, setState, config]);

  useEffect(() => {
    const unregisterRollback = websocketService.registerRollbackCallback(rollbackPendingTransactions);
    
    return () => {
      unregisterRollback();
    };
  }, [rollbackPendingTransactions]);

  const sendTransactionalAction = useCallback(
    async (payload: TPayload): Promise<string> => {
      if (config.validatePayload && !config.validatePayload(payload)) {
        const error = new Error('Payload validation failed');
        logger.error('WebSocket transaction validation failed:', payload);
        throw error;
      }

      const transactionId = generateId();
      
      logger.debug(`Sending ${config.actionType || 'message'}: ${transactionId}`);

      const newState = config.optimisticUpdate(currentState, payload, transactionId);
      setState(newState);

      const payloadWithInstanceId = { ...payload, instanceId: transactionId };

      if (websocketService.isConnected()) {
        try {
          setPendingTransactions((prev) => {
            const updated = new Map(prev);
            
            const timeoutId = setTimeout(() => {
              handleTransactionTimeout(transactionId);
            }, WEBSOCKET_CONFIG.TRANSACTION_TIMEOUT);
            
            updated.set(transactionId, {
              payload,
              timestamp: Date.now(),
              status: 'pending',
              timeoutId,
            });
            return updated;
          });

          await websocketService.sendMessage(config.destination, payloadWithInstanceId);
          
          logger.debug(`${config.actionType || 'Message'} sent, awaiting confirmation: ${transactionId}`);
          
          
          return transactionId;
        } catch (error) {
          logger.error(`WebSocket send failed for transaction ${transactionId}:`, error);
          updateTransactionStatus(transactionId, 'failed');
          
            config.onFailure?.(error as Error, payload, transactionId);
          
          return transactionId;
        }
      } else {
        const disconnectedError = new Error('Cannot send - WebSocket disconnected');
        logger.warn(`WebSocket disconnected, cannot send transaction: ${transactionId}`);
        setPendingTransactions((prev) => {
          const updated = new Map(prev);
          updated.set(transactionId, {
            payload,
            timestamp: Date.now(),
            status: 'failed',
            timeoutId: undefined,
          });
          logger.warn(`Transaction ${transactionId} failed - no connection`);
          return updated;
        });

        config.onFailure?.(disconnectedError, payload, transactionId);
        
        return transactionId;
      }
    },
    [config, currentState, setState, generateId, updateTransactionStatus, handleTransactionTimeout],
  );

  const commitTransaction = useCallback((transactionId: string) => {
    setPendingTransactions((prev) => {
      const updated = new Map(prev);
      const transaction = updated.get(transactionId);
      
      if (transaction) {
        logger.debug(`Server confirmed transaction: ${transactionId}`);
        
        if (transaction.timeoutId) {
          clearTimeout(transaction.timeoutId);
        }
        config.onSuccess?.(transaction.payload, transactionId);
        updated.delete(transactionId);
        
        logger.debug(`Transaction completed and cleaned up: ${transactionId} (${updated.size} remaining)`);
      } else {
        logger.debug(`Transaction ${transactionId} already cleaned up (likely timed out)`);
      }
      return updated;
    });
  }, [config]);

  const isPending = useCallback(
    (transactionId: string): boolean => {
      return pendingTransactions.has(transactionId);
    },
    [pendingTransactions],
  );

  const getTransactionStatus = useCallback(
    (transactionId: string): 'sending' | 'confirmed' | 'failed' | null => {
      const transaction = pendingTransactions.get(transactionId);
      if (!transaction) return null;
      return transaction.status === 'pending' ? 'sending' : transaction.status;
    },
    [pendingTransactions],
  );


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