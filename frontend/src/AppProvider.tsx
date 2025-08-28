import React, { type ReactNode } from 'react';

import { AuthProvider } from 'features/auth/AuthProvider';
import { UserPreferencesProvider } from 'features/settings/UserPreferencesProvider';
import { WebSocketProvider } from 'features/websocket/WebSocketProvider';

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <UserPreferencesProvider>
          {children}
        </UserPreferencesProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
};
