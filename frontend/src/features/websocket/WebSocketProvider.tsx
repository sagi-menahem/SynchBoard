import { useAuth } from 'features/auth/hooks';
import websocketService from 'features/websocket/services/websocketService';
import React, { useEffect, useState, useMemo, useCallback, type ReactNode } from 'react';
import logger from 'shared/utils/logger';

import { WebSocketContext } from './WebSocketContext';

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { token, userEmail } = useAuth();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected');

  const updateConnectionState = useCallback(() => {
    const currentState = websocketService.getConnectionState();
    setConnectionState(currentState);
    setIsSocketConnected(currentState === 'connected');
  }, []);

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval>;
    let isEffectActive = true;

    const wrappedUpdateConnectionState = () => {
      if (!isEffectActive) {
        return;
      }
      updateConnectionState();
    };

    const startPolling = () => {
      pollInterval = setInterval(() => {
        if (!isEffectActive) {
          return;
        }
        wrappedUpdateConnectionState();
      }, 3000);
    };

    if (token) {
      setConnectionState('connecting');
      websocketService.connect(token, () => {
        if (!isEffectActive) {
          return;
        }

        setIsSocketConnected(true);
        setConnectionState('connected');

        if (userEmail) {
          websocketService.subscribe('/user/queue/errors', (errorMessage: unknown) => {
            logger.error('Server error received:', errorMessage);
          });
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
  }, [token, userEmail, updateConnectionState]);

  const value = useMemo(
    () => ({
      isSocketConnected,
      connectionState,
    }),
    [isSocketConnected, connectionState],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
