import React, { createContext, useContext } from 'react';

import { useUserBoardPreferencesService } from './hooks/useUserBoardPreferencesService';
import type { UserBoardPreferences } from './services/userPreferencesService';
import { UserPreferencesStyleInjector } from './UserPreferencesStyleInjector';

export type { UserBoardPreferences };

/**
 * Context interface for user board preferences management providing board-specific configuration.
 */
export interface UserBoardPreferencesContextType {
  // Current user board preferences configuration including background and visual settings
  preferences: UserBoardPreferences;
  // Loading state indicator for asynchronous preference operations
  isLoading: boolean;
  // Error message for failed operations, null when no error
  error: string | null;
  // Function to update board background setting with toast notifications
  updateBoardBackground: (background: string) => Promise<void>;
  // Function to update multiple board preferences with toast notifications
  updatePreferences: (preferences: Partial<UserBoardPreferences>) => Promise<void>;
  // Function to update preferences silently without user notifications
  updatePreferencesSilent: (preferences: Partial<UserBoardPreferences>) => Promise<void>;
  // Function to refresh preferences from server storage
  refreshPreferences: () => Promise<void>;
  // Function to clear current error state
  resetError: () => void;
}

const UserBoardPreferencesContext = createContext<UserBoardPreferencesContextType | undefined>(
  undefined,
);

/**
 * Props for the UserBoardPreferencesProvider component.
 */
interface UserBoardPreferencesProviderProps {
  /** Child components that will have access to user board preferences context */
  children: React.ReactNode;
}

/**
 * React Context Provider component for managing user board preferences across the application.
 * Provides global state management for board-specific settings including backgrounds, visual preferences, and UI customizations.
 * Integrates with authentication system to provide persistent user preferences with both explicit and silent update modes.
 * The value object exposes board preferences state, loading indicators, error handling, and multiple update functions.
 *
 * @param children - Child components that will consume the user board preferences context
 */
export const UserBoardPreferencesProvider: React.FC<UserBoardPreferencesProviderProps> = ({
  children,
}) => {
  const value = useUserBoardPreferencesService();

  return (
    <UserBoardPreferencesContext.Provider value={value}>
      <UserPreferencesStyleInjector />
      {children}
    </UserBoardPreferencesContext.Provider>
  );
};

export const useUserBoardPreferences = (): UserBoardPreferencesContextType => {
  const context = useContext(UserBoardPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserBoardPreferences must be used within a UserBoardPreferencesProvider');
  }
  return context;
};
