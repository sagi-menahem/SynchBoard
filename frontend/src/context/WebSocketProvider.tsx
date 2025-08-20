import React, { useEffect, useState, type ReactNode } from 'react';

import logger from 'utils/Logger';

import { useAuth } from 'hooks/auth';
import websocketService from 'services/WebSocketService';

import { WebSocketContext } from './WebSocketContext';

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { token, userEmail } = useAuth();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    const updateConnectionState = () => {
      const currentState = websocketService.getConnectionState();
      setConnectionState(currentState);
      
      setIsSocketConnected(currentState === 'connected');
      
    };

    updateConnectionState();

    let pollInterval: ReturnType<typeof setInterval>;
    
    const startPolling = () => {
      pollInterval = setInterval(() => {
        const state = websocketService.getConnectionState();
        if (state !== connectionState) {
          updateConnectionState();
        }
        
      }, 3000);
    };
    
    startPolling();

    if (token) {
      setConnectionState('connecting');
      websocketService.connect(token, () => {
        setIsSocketConnected(true);
        setConnectionState('connected');
                
        if (userEmail) {
          websocketService.subscribe(
            '/user/queue/errors',
            (errorMessage: unknown) => {
              logger.error('Server error received:', errorMessage);
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
  }, [token, userEmail, connectionState]);
  const value = {
    isSocketConnected,
    connectionState,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};