import { useCallback, useEffect, useRef } from 'react';

import logger from 'utils/logger';

import websocketService from 'services/websocketService';

import { useWebSocket } from '../websocket/useWebSocket';


export const useSocket = <T>(topic: string, onMessageReceived: (message: T) => void, schemaKey?: string) => {
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

        let subscription: ReturnType<typeof websocketService.subscribe> = null;

        const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
            if (websocketService.isConnected()) {
                logger.debug(`useSocket: Subscribing to ${topic}`);
                subscription = websocketService.subscribe<T>(topic, stableOnMessageReceived, schemaKey);
            } else {
                logger.debug(`useSocket: WebSocket not ready for ${topic}, will retry when connected`);
            }
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (subscription) {
                try {
                    logger.debug(`useSocket: Unsubscribing from ${topic}`);
                    subscription.unsubscribe();
                } catch (error) {
                    logger.warn(`Failed to unsubscribe from ${topic}:`, error);
                }
            }
        };
    }, [isSocketConnected, topic, stableOnMessageReceived, schemaKey]);
};
