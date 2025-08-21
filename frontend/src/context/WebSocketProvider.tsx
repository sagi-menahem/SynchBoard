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
    let pollInterval: ReturnType<typeof setInterval>;
    let isEffectActive = true;
    
    const updateConnectionState = () => {
      if (!isEffectActive) return;
      
      const currentState = websocketService.getConnectionState();
      setConnectionState(currentState);
      setIsSocketConnected(currentState === 'connected');
    };

    const startPolling = () => {
      pollInterval = setInterval(() => {
        if (!isEffectActive) return;
        updateConnectionState();
      }, 3000);
    };

    if (token) {
      setConnectionState('connecting');
      websocketService.connect(token, () => {
        if (!isEffectActive) return;
        
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

    startPolling();

    return () => {
      isEffectActive = false;
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