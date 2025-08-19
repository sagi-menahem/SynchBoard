import { useEffect, useState } from 'react';

import websocketService from 'services/websocketService';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

/**
 * Hook for tracking WebSocket connection status in real-time.
 * 
 * @returns ConnectionStatus - The current WebSocket connection state
 * 
 * This hook provides a reactive way to monitor WebSocket connection status
 * without relying on context polling. It directly uses the WebSocket service's
 * getConnectionState() method and updates when the connection state changes.
 * 
 * The hook is optimized to prevent unnecessary re-renders by only updating
 * when the connection state actually changes.
 */
export const useWebSocketConnection = (): ConnectionStatus => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() => 
    websocketService.getConnectionState(),
  );

  useEffect(() => {
    // Set initial state
    const initialState = websocketService.getConnectionState();
    setConnectionStatus(initialState);

    // Poll for connection state changes
    // Using a shorter interval for more responsive updates
    const pollInterval = setInterval(() => {
      const currentState = websocketService.getConnectionState();
      setConnectionStatus((prevState) => {
        // Only update state if it has actually changed to prevent unnecessary re-renders
        if (prevState !== currentState) {
          return currentState;
        }
        return prevState;
      });
    }, 250); // Poll every 250ms for more responsive updates

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  return connectionStatus;
};