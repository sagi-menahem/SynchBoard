import { createContext } from 'react';

import type { ConnectionStatus } from 'services/websocketService';

export interface WebSocketContextType {
    isSocketConnected: boolean;
    connectionState: ConnectionStatus;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);
