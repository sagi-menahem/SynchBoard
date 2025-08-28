import { useCallback, useContext, useEffect, useRef } from 'react';


import { WebSocketContext } from '../WebSocketContext';
import WebSocketService from 'features/websocket/services/websocketService';
import logger from 'shared/utils/logger';

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);

  if (context === undefined) {
    const error = new Error('useWebSocket must be used within a WebSocketProvider');
    logger.error('[useWebSocket] Context not found - missing WebSocketProvider wrapper');
    throw error;
  }

  return context;
};

export const useSocket = useWebSocket;

export const useSocketSubscription = <T>(
  topic: string,
  onMessageReceived: (message: T) => void,
  schemaKey?: string,
) => {
  const { isSocketConnected } = useWebSocket();
  const onMessageReceivedRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const stableOnMessageReceived = useCallback((message: T) => {
    onMessageReceivedRef.current(message);
  }, []);

  useEffect(() => {
    if (!isSocketConnected || !topic) {
      return;
    }

    let subscription: ReturnType<typeof WebSocketService.subscribe> = null;

    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      if (WebSocketService.isConnected()) {
        subscription = WebSocketService.subscribe<T>(topic, stableOnMessageReceived, schemaKey);
      }
    }, 100);

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
