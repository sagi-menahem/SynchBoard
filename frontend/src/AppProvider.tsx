import React, { type ReactNode } from 'react';

import { AuthProvider } from 'features/auth/AuthProvider';
import { CanvasPreferencesProvider } from 'features/settings/CanvasPreferencesProvider';
import { ThemeProvider } from 'features/settings/ThemeProvider';
import { ToolPreferencesProvider } from 'features/settings/ToolPreferencesProvider';
import { UserBoardPreferencesProvider } from 'features/settings/UserBoardPreferencesProvider';
import { WebSocketProvider } from 'features/websocket/WebSocketProvider';

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <ThemeProvider>
          <ToolPreferencesProvider>
            <CanvasPreferencesProvider>
              <UserBoardPreferencesProvider>
                {children}
              </UserBoardPreferencesProvider>
            </CanvasPreferencesProvider>
          </ToolPreferencesProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
};
