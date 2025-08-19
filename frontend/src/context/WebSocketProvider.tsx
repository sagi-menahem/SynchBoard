import React, { useEffect, useState, type ReactNode } from 'react';

import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import websocketService from 'services/websocketService';

import { WebSocketContext } from './WebSocketContext';

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { token, userEmail } = useAuth();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    // Poll connection state periodically to keep UI in sync
    const pollConnectionState = () => {
      const currentState = websocketService.getConnectionState();
      setConnectionState(currentState);
      setIsSocketConnected(currentState === 'connected');
    };

    const pollInterval = setInterval(pollConnectionState, 500); // Poll every 500ms

    if (token) {
      setConnectionState('connecting');
      websocketService.connect(token, () => {
        logger.debug('WebSocket connection confirmed in WebSocketProvider.');
        setIsSocketConnected(true);
        setConnectionState('connected');
                
        // Subscribe to user-specific error channel
        if (userEmail) {
          websocketService.subscribe(
            '/user/queue/errors',
            (errorMessage: unknown) => {
              logger.error('WebSocket error received:', errorMessage);
            },
          );
        }
      });
    } else {
      setIsSocketConnected(false);
      setConnectionState('disconnected');
    }

    return () => {
      clearInterval(pollInterval);
      websocketService.disconnect();
      setIsSocketConnected(false);
      setConnectionState('disconnected');
    };
  }, [token, userEmail]);

  const value = {
    isSocketConnected,
    connectionState,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
