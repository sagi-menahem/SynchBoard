import { createContext } from 'react';

import type { ConnectionStatus } from 'services/websocketService';

export interface TransactionMethods {
    createTransaction: <T>(
      id: string, 
      payload: T, 
      onSuccess?: (payload: T, id: string) => void, 
      onFailure?: (error: Error, payload: T, id: string) => void
    ) => void;
    commitTransaction: (id: string) => boolean;
    isPending: (id: string) => boolean;
    getTransactionStatus: (id: string) => 'sending' | 'processing' | 'failed' | 'confirmed' | null;
    pendingCount: number;
    pendingTransactionIds: string[];
}

export interface WebSocketContextType {
    isSocketConnected: boolean;
    connectionState: ConnectionStatus;
    // Centralized transaction methods
    transactions: TransactionMethods;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);
