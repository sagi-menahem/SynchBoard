import React, { createContext, useContext } from 'react';

import { useUserBoardPreferencesService } from 'hooks/useUserBoardPreferencesService';
import type { UserBoardPreferences } from 'services/userPreferencesService';

export type { UserBoardPreferences };

export interface UserBoardPreferencesContextType {
  preferences: UserBoardPreferences;
  isLoading: boolean;
  error: string | null;
  updateBoardBackground: (background: string) => Promise<void>;
  updatePreferences: (preferences: Partial<UserBoardPreferences>) => Promise<void>;
  updatePreferencesSilent: (preferences: Partial<UserBoardPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
  resetError: () => void;
}

const UserBoardPreferencesContext = createContext<UserBoardPreferencesContextType | undefined>(undefined);

interface UserBoardPreferencesProviderProps {
  children: React.ReactNode;
}

export const UserBoardPreferencesProvider: React.FC<UserBoardPreferencesProviderProps> = ({ children }) => {
  const value = useUserBoardPreferencesService();
  
  return <UserBoardPreferencesContext.Provider value={value}>{children}</UserBoardPreferencesContext.Provider>;
};

// Hook to use the context
export const useUserBoardPreferences = (): UserBoardPreferencesContextType => {
  const context = useContext(UserBoardPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserBoardPreferences must be used within a UserBoardPreferencesProvider');
  }
  return context;
};

