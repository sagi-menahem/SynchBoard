import { createContext } from 'react';

export interface WebSocketContextType {
  isSocketConnected: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected';
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);
