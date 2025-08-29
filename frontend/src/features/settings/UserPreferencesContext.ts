import { createContext } from 'react';

import type { Tool } from 'shared/types/CommonTypes';

export type LayoutMode = 'focus-canvas' | 'balanced' | 'focus-chat';
export type Theme = 'light' | 'dark';

// Unified preferences interface combining all three contexts
export interface UserPreferences {
  // From PreferencesProvider
  boardBackgroundSetting: string;
  
  // From CanvasPreferencesProvider  
  canvasChatSplitRatio: number;
  layoutMode: LayoutMode;
  
  // From ToolPreferencesProvider
  defaultTool: Tool;
  defaultStrokeColor: string;
  defaultStrokeWidth: number;
  
  // Theme preferences
  theme: Theme;
}

export interface UserPreferencesState {
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

export interface UserPreferencesContextType {
  // State
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
  
  // General preferences methods
  updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  updatePreferencesSilent: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  
  // Canvas preferences methods
  updateSplitRatio: (splitRatio: number) => Promise<void>;
  updateLayoutMode: (layoutMode: LayoutMode) => Promise<void>;
  
  // Tool preferences methods
  updateTool: (tool: Tool) => Promise<void>;
  updateStrokeColor: (color: string) => Promise<void>;
  updateStrokeWidth: (width: number) => Promise<void>;
  
  // Theme preferences methods
  setTheme: (theme: Theme) => void;
  
  // Utility methods
  refreshPreferences: () => Promise<void>;
  resetError: () => void;
}

export const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);