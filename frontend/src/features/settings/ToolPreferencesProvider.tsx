import React, { createContext, useContext } from 'react';

import {
  useToolPreferencesAPI,
  type ToolPreferences,
} from 'features/settings/hooks/useToolPreferencesAPI';
import type { Tool } from 'shared/types/CommonTypes';

export interface ToolPreferencesContextType {
  preferences: ToolPreferences;
  isLoading: boolean;
  error: string | null;
  updateTool: (tool: Tool) => Promise<void>;
  updateStrokeColor: (color: string) => Promise<void>;
  updateStrokeWidth: (width: number) => Promise<void>;
  updateToolPreferences: (preferences: Partial<ToolPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
  resetError: () => void;
}

const ToolPreferencesContext = createContext<ToolPreferencesContextType | undefined>(undefined);

interface ToolPreferencesProviderProps {
  children: React.ReactNode;
}

export const ToolPreferencesProvider: React.FC<ToolPreferencesProviderProps> = ({ children }) => {
  const toolPreferencesAPI = useToolPreferencesAPI();

  return (
    <ToolPreferencesContext.Provider value={toolPreferencesAPI}>
      {children}
    </ToolPreferencesContext.Provider>
  );
};

// Hook to use the context
export const useToolPreferences = (): ToolPreferencesContextType => {
  const context = useContext(ToolPreferencesContext);
  if (context === undefined) {
    throw new Error('useToolPreferences must be used within a ToolPreferencesProvider');
  }
  return context;
};
