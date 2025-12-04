import { useCallback, useContext, useEffect, useRef } from 'react';

import logger from 'shared/utils/logger';

import { WebSocketContext } from '../WebSocketContext';

// Lazy-load websocket service to reduce initial bundle size
type WebSocketServiceModule = typeof import('../services/websocketService');
let cachedService: WebSocketServiceModule['default'] | null = null;
const getWebSocketService = async () => {
  if (!cachedService) {
    const module = await import('../services/websocketService');
    cachedService = module.default;
  }
  return cachedService;
};

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

    let subscription: { unsubscribe: () => void } | null = null;
    let isEffectActive = true;

    // Short delay to ensure connection is fully established before subscribing
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      void getWebSocketService().then((service) => {
        if (!isEffectActive) return;
        if (service.isConnected()) {
          subscription = service.subscribe<T>(topic, stableOnMessageReceived, schemaKey);
        }
      });
    }, 100); // Brief delay ensures WebSocket connection is fully established before subscribing

    // Cleanup subscription and timeout on effect cleanup
    return () => {
      isEffectActive = false;
      clearTimeout(timeoutId);
      if (subscription) {
        // Capture subscription reference for async callback
        const sub = subscription;
        // Only unsubscribe if connection is still active to avoid
        // "WebSocket is already in CLOSING or CLOSED state" errors
        void getWebSocketService().then((service) => {
          if (service.isConnected()) {
            try {
              sub.unsubscribe();
            } catch (error) {
              logger.warn(`Failed to unsubscribe from ${topic}:`, error);
            }
          }
        });
      }
    };
  }, [isSocketConnected, topic, stableOnMessageReceived, schemaKey]);
};
