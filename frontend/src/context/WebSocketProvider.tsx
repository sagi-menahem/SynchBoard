import React, { useEffect, useState, useMemo, useRef, type ReactNode } from 'react';

import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import transactionService from 'services/transactionService';
import websocketService, { type ConnectionStatus } from 'services/websocketService';

import { WebSocketContext, type TransactionMethods } from './WebSocketContext';

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { token, userEmail } = useAuth();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionStatus>('connecting');

  // Use refs to track previous values and prevent unnecessary re-runs
  const prevTokenRef = useRef<string | null>(null);
  const prevUserEmailRef = useRef<string | null>(null);

  // Debug logs removed for production performance

  useEffect(() => {
    const tokenChanged = token !== prevTokenRef.current;
    const userEmailChanged = userEmail !== prevUserEmailRef.current;
    
    // Only proceed if actual values changed to prevent unnecessary cycles
    if (!tokenChanged && !userEmailChanged) {
      return;
    }
    
    // Update refs
    prevTokenRef.current = token;
    prevUserEmailRef.current = userEmail;
    
    // Subscribe to instant connection status updates instead of polling
    const unsubscribeFromConnectionChanges = websocketService.subscribeToConnectionChanges(
      (status: ConnectionStatus) => {
        setConnectionState(status);
        setIsSocketConnected(status === 'connected');
        logger.debug(`WebSocket connection status updated to: ${status}`);
      },
    );

    if (token) {
      websocketService.connect(token, () => {
        logger.debug('WebSocket connection confirmed in WebSocketProvider.');
                
        // Subscribe to user-specific error channel with delay to ensure STOMP is ready
        if (userEmail) {
          // Small delay to ensure STOMP connection is fully established
          setTimeout(() => {
            logger.debug('Attempting to subscribe to user error queue...');
            const subscription = websocketService.subscribe(
              '/user/queue/errors',
              (errorMessage: unknown) => {
                logger.error('WebSocket error received:', errorMessage);
              },
            );
            
            if (subscription) {
              logger.debug('Successfully subscribed to user error queue');
            } else {
              logger.warn('Failed to subscribe to user error queue - will be retried automatically');
            }
          }, 200); // 200ms delay to ensure STOMP is ready
        }
      });
    } else {
      // When no token, ensure disconnected state  
      websocketService.disconnect();
    }

    return () => {
      unsubscribeFromConnectionChanges();
      websocketService.disconnect();
      // Clear all pending transactions on disconnect
      transactionService.clearAllTransactions();
    };
  }, [token, userEmail]);

  // Centralized transaction methods
  const transactionMethods: TransactionMethods = useMemo(() => ({
    createTransaction: <T = unknown>(
      id: string, 
      payload: T, 
      onSuccess?: (payload: T, id: string) => void, 
      onFailure?: (error: Error, payload: T, id: string) => void,
    ) => {
      transactionService.createTransaction(id, payload, 10000, onSuccess, onFailure);
      transactionService.updateTransactionStatus(id, 'processing');
    },
    commitTransaction: (id: string) => transactionService.commitTransaction(id),
    isPending: (id: string) => transactionService.isPending(id),
    getTransactionStatus: (id: string) => transactionService.getTransactionStatus(id),
    get pendingCount() { return transactionService.getPendingCount(); },
    get pendingTransactionIds() { return transactionService.getPendingTransactionIds(); },
  }), []);

  const contextValue = useMemo(() => ({
    isSocketConnected,
    connectionState,
    transactions: transactionMethods,
  }), [isSocketConnected, connectionState]);

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};
