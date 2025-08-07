import { useEffect } from 'react';

import websocketService from 'services/websocketService';

import { useWebSocket } from '../websocket/useWebSocket';

export const useSocket = <T>(topic: string, onMessageReceived: (message: T) => void, schemaKey?: string) => {
    const { isSocketConnected } = useWebSocket();

    useEffect(() => {
        if (!isSocketConnected || !topic) {
            return;
        }

        let subscription: ReturnType<typeof websocketService.subscribe> = null;

        const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
            if (websocketService.isConnected()) {
                console.log(`useSocket: Subscribing to ${topic}`);
                subscription = websocketService.subscribe<T>(topic, onMessageReceived, schemaKey);
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
    }, [isSocketConnected, topic, onMessageReceived, schemaKey]);
};
