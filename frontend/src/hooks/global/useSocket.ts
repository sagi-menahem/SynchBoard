import { useEffect } from 'react';

import websocketService from 'services/websocketService';

import { useWebSocket } from '../websocket/useWebSocket';

export const useSocket = <T>(topic: string, onMessageReceived: (message: T) => void, schemaKey?: string) => {
    const { isSocketConnected } = useWebSocket();

    useEffect(() => {
        if (!isSocketConnected || !topic) {
            return;
        }

        console.log(`useSocket: Subscribing to ${topic}`);
        const subscription = websocketService.subscribe<T>(topic, onMessageReceived, schemaKey);

        return () => {
            if (subscription) {
                console.log(`useSocket: Unsubscribing from ${topic}`);
                subscription.unsubscribe();
            }
        };
    }, [isSocketConnected, topic, onMessageReceived, schemaKey]);
};
