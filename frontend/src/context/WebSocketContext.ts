import { createContext } from 'react';

export interface WebSocketContextType {
    isSocketConnected: boolean;
    connectionState: 'disconnected' | 'connecting' | 'connected' | 'permanently_disconnected';
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);
