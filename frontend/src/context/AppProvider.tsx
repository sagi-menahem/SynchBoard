// File: frontend/src/context/AppProvider.tsx
import React, { type ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { PreferencesProvider } from './PreferencesProvider';
import { WebSocketProvider } from './WebSocketProvider';

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    return (
        <AuthProvider>
            <WebSocketProvider>
                <PreferencesProvider>{children}</PreferencesProvider>
            </WebSocketProvider>
        </AuthProvider>
    );
};
