import React, { type ReactNode } from 'react';

import { AuthProvider } from './AuthProvider';
import { CanvasPreferencesProvider } from './CanvasPreferencesContext';
import { PreferencesProvider } from './PreferencesProvider';
import { ToolPreferencesProvider } from './ToolPreferencesContext';
import { WebSocketProvider } from './WebSocketProvider';

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
