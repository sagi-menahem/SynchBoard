import WebSocketService from 'features/websocket/services/websocketService';
import { useCallback, useContext, useEffect, useRef } from 'react';

import logger from 'shared/utils/logger';

import { WebSocketContext } from '../WebSocketContext';

/**
 * Custom hook that provides access to WebSocket context and connection state.
 * Ensures components are properly wrapped in WebSocketProvider and provides
 * centralized access to connection status and state management.
 * 
 * @returns WebSocket context containing connection state and status flags
 * @throws {Error} When used outside of WebSocketProvider wrapper
 */
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);

  if (context === undefined) {
    const error = new Error('useWebSocket must be used within a WebSocketProvider');
    logger.error('[useWebSocket] Context not found - missing WebSocketProvider wrapper');
    throw error;
  }

  return context;
};

/**
 * Alias for useWebSocket hook providing semantic clarity for socket operations.
 * Identical functionality to useWebSocket with shorter, more intuitive naming.
 */
export const useSocket = useWebSocket;

/**
 * Custom hook that manages WebSocket topic subscriptions with automatic lifecycle management.
 * Handles subscription setup, message routing, and cleanup for STOMP topics with optional
 * message validation schemas. Provides stable message handling and connection state awareness.
 * 
 * Key features:
 * - Automatic subscription when WebSocket connects and topic is provided
 * - Stable message callback handling to prevent unnecessary re-subscriptions
 * - Connection state awareness - only subscribes when connected
 * - Automatic cleanup on unmount or dependency changes
 * - Optional schema validation for incoming messages
 * - Delayed subscription setup to ensure connection stability
 * 
 * @param topic - STOMP topic path to subscribe to (e.g., '/topic/board/123')
 * @param onMessageReceived - Callback function to handle incoming messages
 * @param schemaKey - Optional validation schema key for message validation
 */
export const useSocketSubscription = <T>(
  topic: string,
  onMessageReceived: (message: T) => void,
  schemaKey?: string,
) => {
  const { isSocketConnected } = useWebSocket();
  // Ref to maintain stable reference to latest message handler
  const onMessageReceivedRef = useRef(onMessageReceived);

  // Keep ref current with latest callback to avoid stale closures
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  // Stable callback that always calls the latest message handler - memoized to prevent subscription churn
  const stableOnMessageReceived = useCallback((message: T) => {
    onMessageReceivedRef.current(message);
  }, []);

  // Manages WebSocket subscription lifecycle with connection state and topic dependencies
  useEffect(() => {
    // Only attempt subscription when connected and topic is provided
    if (!isSocketConnected || !topic) {
      return;
    }

    let subscription: ReturnType<typeof WebSocketService.subscribe> = null;

    // Short delay to ensure connection is fully established before subscribing
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      if (WebSocketService.isConnected()) {
        subscription = WebSocketService.subscribe<T>(topic, stableOnMessageReceived, schemaKey);
      }
    }, 100);

    // Cleanup subscription and timeout on effect cleanup
    return () => {
      clearTimeout(timeoutId);
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          logger.warn(`Failed to unsubscribe from ${topic}:`, error);
        }
      }
    };
  }, [isSocketConnected, topic, stableOnMessageReceived, schemaKey]);
};
