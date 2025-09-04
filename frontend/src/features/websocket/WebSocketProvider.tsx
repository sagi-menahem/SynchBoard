import { useAuth } from 'features/auth/hooks';
import websocketService from 'features/websocket/services/websocketService';
import React, { useEffect, useState, useMemo, useCallback, type ReactNode } from 'react';
import logger from 'shared/utils/logger';

import { WebSocketContext } from './WebSocketContext';

/**
 * Properties for the WebSocketProvider component defining child component wrapping.
 */
interface WebSocketProviderProps {
  /** Child components that will have access to WebSocket context */
  children: ReactNode;
}

/**
 * WebSocket context provider that manages real-time STOMP connection lifecycle and state.
 * Handles automatic connection establishment when user is authenticated, connection polling
 * for state synchronization, and cleanup on authentication changes. Provides WebSocket
 * connection status and state to all child components through React context.
 *
 * The provider manages:
 * - Automatic STOMP WebSocket connection when JWT token is available
 * - Connection state polling every 3 seconds to maintain UI synchronization
 * - Error queue subscription for server-side error notifications
 * - Cleanup and disconnection when user logs out or component unmounts
 * - Connection state transitions (disconnected → connecting → connected)
 *
 * @param children - Child components that will have access to WebSocket context
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { token, userEmail } = useAuth();
  // Local WebSocket connection state mirroring service state for React rendering
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected');

  // Synchronize React state with underlying WebSocket service state
  const updateConnectionState = useCallback(() => {
    const currentState = websocketService.getConnectionState();
    setConnectionState(currentState);
    setIsSocketConnected(currentState === 'connected');
  }, []);

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval>;
    // Cleanup flag to prevent state updates after component unmount
    let isEffectActive = true;

    const wrappedUpdateConnectionState = () => {
      if (!isEffectActive) {
        return;
      }
      updateConnectionState();
    };

    // Poll connection state every 3 seconds to keep UI synchronized
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
      // Establish STOMP connection with JWT authentication
      websocketService.connect(token, () => {
        if (!isEffectActive) {
          return;
        }

        setIsSocketConnected(true);
        setConnectionState('connected');

        // Subscribe to server error notifications for authenticated users
        if (userEmail) {
          websocketService.subscribe('/user/queue/errors', (errorMessage: unknown) => {
            logger.error('Server error received:', errorMessage);
          });
        }
      });
    } else {
      // No token means user is not authenticated
      setIsSocketConnected(false);
      setConnectionState('disconnected');
    }

    startPolling();

    // Cleanup function to prevent memory leaks and connection issues
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
