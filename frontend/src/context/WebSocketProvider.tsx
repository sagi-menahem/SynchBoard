import React, { useEffect, useState, type ReactNode } from 'react';

import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import websocketService, { type ConnectionStatus } from 'services/websocketService';

import { WebSocketContext } from './WebSocketContext';

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { token, userEmail } = useAuth();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    // Subscribe to instant connection status updates instead of polling
    const unsubscribeFromConnectionChanges = websocketService.subscribeToConnectionChanges((status: ConnectionStatus) => {
      setConnectionState(status);
      setIsSocketConnected(status === 'connected');
      logger.debug(`WebSocket connection status updated to: ${status}`);
    });

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
    };
  }, [token, userEmail]);

  const value = {
    isSocketConnected,
    connectionState,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
