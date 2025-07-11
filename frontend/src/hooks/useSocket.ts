// File: frontend/src/hooks/useSocket.ts

import { useEffect } from 'react';
import websocketService from '../services/websocketService';
import { useAuth } from './useAuth';

export const useSocket = <T>(topic: string, onMessageReceived: (message: T) => void) => {
    const { isSocketConnected } = useAuth();

    useEffect(() => {
        if (!isSocketConnected || !topic) {
            return;
        }

        console.log(`useSocket: Subscribing to ${topic}`);
        const subscription = websocketService.subscribe<T>(topic, onMessageReceived);

        return () => {
            if (subscription) {
                console.log(`useSocket: Unsubscribing from ${topic}`);
                subscription.unsubscribe();
            }
        };
    }, [isSocketConnected, topic, onMessageReceived]);
};