import { useCallback, useEffect, useRef } from 'react';

import websocketService from 'services/websocketService';

import { useWebSocket } from '../websocket/useWebSocket';

export const useSocket = <T>(topic: string, onMessageReceived: (message: T) => void, schemaKey?: string) => {
    const { isSocketConnected } = useWebSocket();
    const onMessageReceivedRef = useRef(onMessageReceived);

    // Keep the ref updated with the latest callback
    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    // Create a stable callback that uses the ref
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
                console.log(`useSocket: Subscribing to ${topic}`);
                subscription = websocketService.subscribe<T>(topic, stableOnMessageReceived, schemaKey);
            } else {
                console.log(`useSocket: WebSocket not ready for ${topic}, will retry when connected`);
            }
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (subscription) {
                try {
                    console.log(`useSocket: Unsubscribing from ${topic}`);
                    subscription.unsubscribe();
                } catch (error) {
                    console.warn(`Failed to unsubscribe from ${topic}:`, error);
                }
            }
        };
    }, [isSocketConnected, topic, stableOnMessageReceived, schemaKey]);
};
