import {
  useToolPreferencesAPI,
  type ToolPreferences,
} from 'features/settings/hooks/useToolPreferencesAPI';
import React, { createContext, useContext } from 'react';

import type { Tool } from 'shared/types/CommonTypes';

/**
 * Context interface for tool preferences management providing drawing tool configuration.
 */
export interface ToolPreferencesContextType {
  // Current tool preferences configuration including default selections and settings
  preferences: ToolPreferences;
  // Loading state indicator for asynchronous preference operations
  isLoading: boolean;
  // Error message for failed operations, null when no error
  error: string | null;
  // Function to update the default drawing tool selection
  updateTool: (tool: Tool) => Promise<void>;
  // Function to update the default stroke color for drawing tools
  updateStrokeColor: (color: string) => Promise<void>;
  // Function to update the default stroke width for drawing tools
  updateStrokeWidth: (width: number) => Promise<void>;
  // Function to update multiple tool preferences in a single operation
  updateToolPreferences: (preferences: Partial<ToolPreferences>) => Promise<void>;
  // Function to refresh preferences from server storage
  refreshPreferences: () => Promise<void>;
  // Function to clear current error state
  resetError: () => void;
}

const ToolPreferencesContext = createContext<ToolPreferencesContextType | undefined>(undefined);

/**
 * Props for the ToolPreferencesProvider component.
 */
interface ToolPreferencesProviderProps {
  /** Child components that will have access to tool preferences context */
  children: React.ReactNode;
}

/**
 * React Context Provider component for managing drawing tool preferences across the application.
 * Provides global state management for default tool selections, stroke colors, stroke widths, and drawing settings.
 * Integrates with authentication system to provide persistent user preferences with optimistic updates.
 * The value object exposes tool preferences state, loading indicators, error handling, and update functions.
 * 
 * @param children - Child components that will consume the tool preferences context
 */
export const ToolPreferencesProvider: React.FC<ToolPreferencesProviderProps> = ({ children }) => {
  const toolPreferencesAPI = useToolPreferencesAPI();

  return (
    <ToolPreferencesContext.Provider value={toolPreferencesAPI}>
      {children}
    </ToolPreferencesContext.Provider>
  );
};

export const useToolPreferences = (): ToolPreferencesContextType => {
  const context = useContext(ToolPreferencesContext);
  if (context === undefined) {
    throw new Error('useToolPreferences must be used within a ToolPreferencesProvider');
  }
  return context;
};
