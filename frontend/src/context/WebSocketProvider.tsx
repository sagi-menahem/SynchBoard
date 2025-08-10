import React, { useEffect, useState, type ReactNode } from 'react';

import logger from 'utils/logger';

import { useAuth } from 'hooks/auth/useAuth';
import websocketService from 'services/websocketService';

import { WebSocketContext } from './WebSocketContext';

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const { token } = useAuth();
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    useEffect(() => {
        if (token) {
            websocketService.connect(token, () => {
                logger.debug('WebSocket connection confirmed in WebSocketProvider.');
                setIsSocketConnected(true);
            });
        } else {
            setIsSocketConnected(false);
        }

        return () => {
            websocketService.disconnect();
            setIsSocketConnected(false);
        };
    }, [token]);

    const value = {
        isSocketConnected,
    };

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
