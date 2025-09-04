import { AuthProvider } from 'features/auth/AuthProvider';
import { CanvasPreferencesProvider } from 'features/settings/CanvasPreferencesProvider';
import { ThemeProvider } from 'features/settings/ThemeProvider';
import { ToolPreferencesProvider } from 'features/settings/ToolPreferencesProvider';
import { UserBoardPreferencesProvider } from 'features/settings/UserBoardPreferencesProvider';
import { WebSocketProvider } from 'features/websocket/WebSocketProvider';
import React, { type ReactNode } from 'react';

/**
 * Props for the AppProvider component.
 */
interface AppProviderProps {
  // The child components to wrap with all application providers
  children: ReactNode;
}

/**
 * Root provider component that combines all application-level React Context providers.
 * Manages the provider hierarchy to ensure proper context dependency order - authentication
 * is established first, followed by WebSocket connection, then user preferences and settings.
 * 
 * @param {AppProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components that will have access to all contexts
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <ThemeProvider>
          <ToolPreferencesProvider>
            <CanvasPreferencesProvider>
              <UserBoardPreferencesProvider>{children}</UserBoardPreferencesProvider>
            </CanvasPreferencesProvider>
          </ToolPreferencesProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
};
