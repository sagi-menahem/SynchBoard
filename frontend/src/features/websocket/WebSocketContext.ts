import { createContext } from 'react';

/**
 * Type definition for the WebSocket context value object.
 * Provides centralized access to real-time connection status and state management
 * for STOMP WebSocket communication throughout the application.
 */
export interface WebSocketContextType {
  // Boolean flag indicating if STOMP WebSocket connection is active and ready for messaging
  isSocketConnected: boolean;
  // Current connection lifecycle state for UI feedback and connection management
  connectionState: 'disconnected' | 'connecting' | 'connected';
}

/**
 * React context for sharing WebSocket connection state across the application.
 * Must be accessed through useWebSocket hook which provides proper error handling
 * for components not wrapped in WebSocketProvider.
 */
export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);
