import { createContext } from 'react';

export interface WebSocketContextType {
    isSocketConnected: boolean;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);
