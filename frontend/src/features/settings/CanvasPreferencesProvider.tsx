import React, { createContext, useContext } from 'react';

import { useCanvasPreferencesService } from './hooks/useCanvasPreferencesService';
import type { CanvasPreferences, LayoutMode } from './services/canvasPreferencesService';

export type { CanvasPreferences, LayoutMode };

/**
 * Context interface for canvas preferences management providing layout and display configuration.
 */
export interface CanvasPreferencesContextType {
  // Current canvas preferences configuration including layout and visual settings
  preferences: CanvasPreferences;
  // Loading state indicator for asynchronous preference operations
  isLoading: boolean;
  // Error message for failed operations, null when no error
  error: string | null;
  // Function to update canvas split ratio for layout adjustments
  updateSplitRatio: (splitRatio: number) => Promise<void>;
  // Function to update canvas layout mode for different display configurations
  updateLayoutMode: (layoutMode: LayoutMode) => Promise<void>;
  // Function to update multiple canvas preferences in a single operation
  updateCanvasPreferences: (preferences: Partial<CanvasPreferences>) => Promise<void>;
  // Function to refresh preferences from server storage
  refreshPreferences: () => Promise<void>;
  // Function to clear current error state
  resetError: () => void;
}

const CanvasPreferencesContext = createContext<CanvasPreferencesContextType | undefined>(undefined);

/**
 * Props for the CanvasPreferencesProvider component.
 */
interface CanvasPreferencesProviderProps {
  /** Child components that will have access to canvas preferences context */
  children: React.ReactNode;
}

/**
 * React Context Provider component for managing canvas layout preferences across the application.
 * Provides global state management for canvas split ratios, layout modes, and visual preferences.
 * Integrates with authentication system to provide persistent user preferences with real-time synchronization.
 * The value object exposes canvas preferences state, loading indicators, error handling, and update functions.
 *
 * @param children - Child components that will consume the canvas preferences context
 */
export const CanvasPreferencesProvider: React.FC<CanvasPreferencesProviderProps> = ({
  children,
}) => {
  const value = useCanvasPreferencesService();

  return (
    <CanvasPreferencesContext.Provider value={value}>{children}</CanvasPreferencesContext.Provider>
  );
};

export const useCanvasPreferences = (): CanvasPreferencesContextType => {
  const context = useContext(CanvasPreferencesContext);
  if (context === undefined) {
    throw new Error('useCanvasPreferences must be used within a CanvasPreferencesProvider');
  }
  return context;
};
