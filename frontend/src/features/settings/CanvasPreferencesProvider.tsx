import React, { createContext, useContext } from 'react';

import { useCanvasPreferencesService } from './hooks/useCanvasPreferencesService';
import type { CanvasPreferences, LayoutMode } from './services/canvasPreferencesService';

export type { CanvasPreferences, LayoutMode };

export interface CanvasPreferencesContextType {
  preferences: CanvasPreferences;
  isLoading: boolean;
  error: string | null;
  updateSplitRatio: (splitRatio: number) => Promise<void>;
  updateLayoutMode: (layoutMode: LayoutMode) => Promise<void>;
  updateCanvasPreferences: (preferences: Partial<CanvasPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
  resetError: () => void;
}

const CanvasPreferencesContext = createContext<CanvasPreferencesContextType | undefined>(undefined);

interface CanvasPreferencesProviderProps {
  children: React.ReactNode;
}

export const CanvasPreferencesProvider: React.FC<CanvasPreferencesProviderProps> = ({
  children,
}) => {
  const value = useCanvasPreferencesService();

  return (
    <CanvasPreferencesContext.Provider value={value}>{children}</CanvasPreferencesContext.Provider>
  );
};

// Hook to use the context
export const useCanvasPreferences = (): CanvasPreferencesContextType => {
  const context = useContext(CanvasPreferencesContext);
  if (context === undefined) {
    throw new Error('useCanvasPreferences must be used within a CanvasPreferencesProvider');
  }
  return context;
};
