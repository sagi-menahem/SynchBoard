import React, { type ReactNode } from 'react';

import { AuthProvider } from 'features/auth/AuthProvider';
import { CanvasPreferencesProvider } from 'features/board/CanvasPreferencesContext';
import { ToolPreferencesProvider } from 'features/board/ToolPreferencesContext';
import { PreferencesProvider } from 'features/settings/PreferencesProvider';
import { WebSocketProvider } from 'features/websocket/WebSocketProvider';

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <PreferencesProvider>
          <CanvasPreferencesProvider>
            <ToolPreferencesProvider>{children}</ToolPreferencesProvider>
          </CanvasPreferencesProvider>
        </PreferencesProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
};
