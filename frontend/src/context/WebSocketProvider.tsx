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
    // Simplified connection state management with clear status indicators
    const updateConnectionState = () => {
      const currentState = websocketService.getConnectionState();
      setConnectionState(currentState);
      
      // Only consider truly connected state as socket connected
      setIsSocketConnected(currentState === 'connected');
      
    };

    // Start with immediate state update
    updateConnectionState();

    // Simple polling for connection state changes
    let pollInterval: ReturnType<typeof setInterval>;
    
    const startPolling = () => {
      // Poll every 3 seconds - reduced frequency for school project
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
                
        // Subscribe to user-specific error channel
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