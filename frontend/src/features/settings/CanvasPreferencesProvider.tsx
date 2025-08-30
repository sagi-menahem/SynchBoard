import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { UserUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import { WEBSOCKET_TOPICS } from 'shared/constants/ApiConstants';
import logger from 'shared/utils/logger';

export type LayoutMode = 'focus-canvas' | 'balanced' | 'focus-chat';

export interface CanvasPreferences {
  canvasChatSplitRatio: number;
  layoutMode: LayoutMode;
}

export interface CanvasPreferencesState {
  preferences: CanvasPreferences;
  isLoading: boolean;
  error: string | null;
}

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

// Action types for reducer
type CanvasPreferencesAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: CanvasPreferences }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_SPLIT_RATIO'; payload: number }
  | { type: 'UPDATE_LAYOUT_MODE'; payload: LayoutMode }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<CanvasPreferences> }
  | { type: 'RESET_ERROR' };

// Default canvas preferences
const defaultCanvasPreferences: CanvasPreferences = {
  canvasChatSplitRatio: 70,
  layoutMode: 'balanced',
};

// Initial state
const initialState: CanvasPreferencesState = {
  preferences: defaultCanvasPreferences,
  isLoading: false,
  error: null,
};

// Reducer function
const canvasPreferencesReducer = (
  state: CanvasPreferencesState,
  action: CanvasPreferencesAction,
): CanvasPreferencesState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
      
    case 'LOAD_SUCCESS':
      return {
        ...state,
        isLoading: false,
        preferences: action.payload,
        error: null,
      };
      
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
      
    case 'UPDATE_SPLIT_RATIO':
      return {
        ...state,
        preferences: { ...state.preferences, canvasChatSplitRatio: action.payload },
        error: null,
      };
      
    case 'UPDATE_LAYOUT_MODE':
      return {
        ...state,
        preferences: { ...state.preferences, layoutMode: action.payload },
        error: null,
      };
      
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
        error: null,
      };
      
    case 'RESET_ERROR':
      return { ...state, error: null };
      
    default:
      return state;
  }
};

const CanvasPreferencesContext = createContext<CanvasPreferencesContextType | undefined>(undefined);

interface CanvasPreferencesProviderProps {
  children: React.ReactNode;
}

export const CanvasPreferencesProvider: React.FC<CanvasPreferencesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(canvasPreferencesReducer, initialState);
  const { token, userEmail } = useAuth();
  const isAuthenticated = !!token;

  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    dispatch({ type: 'LOAD_START' });
    
    try {
      const canvasPrefs = await userService.getCanvasPreferences();
      // Note: layoutMode is client-side only for now, so we keep the default
      const preferences: CanvasPreferences = {
        canvasChatSplitRatio: canvasPrefs.canvasChatSplitRatio,
        layoutMode: 'balanced',
      };
      dispatch({ type: 'LOAD_SUCCESS', payload: preferences });
    } catch (error) {
      logger.error('Failed to load canvas preferences:', error);
      dispatch({ type: 'LOAD_ERROR', payload: 'Failed to load canvas preferences' });
    }
  }, [isAuthenticated]);

  const updateSplitRatio = useCallback(
    async (splitRatio: number) => {
      dispatch({ type: 'UPDATE_SPLIT_RATIO', payload: splitRatio });

      if (isAuthenticated) {
        try {
          await userService.updateCanvasPreferences({ canvasChatSplitRatio: splitRatio });
        } catch (error) {
          logger.error('Failed to update split ratio:', error);
          // Refresh preferences to restore server state
          await refreshPreferences();
          throw error;
        }
      }
    },
    [isAuthenticated, refreshPreferences],
  );

  const updateLayoutMode = useCallback(async (layoutMode: LayoutMode) => {
    // Layout mode is client-side only for now
    dispatch({ type: 'UPDATE_LAYOUT_MODE', payload: layoutMode });
  }, []);

  const updateCanvasPreferences = useCallback(
    async (newPrefs: Partial<CanvasPreferences>) => {
      if (!isAuthenticated) {return;}

      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        // Only update server-side preferences (not layoutMode)
        if (newPrefs.canvasChatSplitRatio !== undefined) {
          await userService.updateCanvasPreferences({
            canvasChatSplitRatio: newPrefs.canvasChatSplitRatio,
          });
        }
      } catch (error) {
        logger.error('Failed to save canvas preferences:', error);
        dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
        dispatch({ type: 'LOAD_ERROR', payload: 'Failed to save canvas preferences' });
        throw error;
      }
    },
    [isAuthenticated, state.preferences],
  );

  const resetError = useCallback(() => {
    dispatch({ type: 'RESET_ERROR' });
  }, []);

  // WebSocket subscription for canvas settings updates
  const handleCanvasSettingsUpdate = useCallback(
    (message: UserUpdateDTO) => {
      if (message.updateType === 'CANVAS_SETTINGS_CHANGED') {
        void refreshPreferences();
      }
    },
    [refreshPreferences],
  );

  useSocketSubscription(
    userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '',
    handleCanvasSettingsUpdate,
    'user',
  );

  // Load preferences on mount and auth change
  useEffect(() => {
    if (isAuthenticated) {
      void refreshPreferences();
    }
  }, [isAuthenticated, refreshPreferences]);

  const value: CanvasPreferencesContextType = {
    preferences: state.preferences,
    isLoading: state.isLoading,
    error: state.error,
    updateSplitRatio,
    updateLayoutMode,
    updateCanvasPreferences,
    refreshPreferences,
    resetError,
  };

  return <CanvasPreferencesContext.Provider value={value}>{children}</CanvasPreferencesContext.Provider>;
};

// Hook to use the context
export const useCanvasPreferences = (): CanvasPreferencesContextType => {
  const context = useContext(CanvasPreferencesContext);
  if (context === undefined) {
    throw new Error('useCanvasPreferences must be used within a CanvasPreferencesProvider');
  }
  return context;
};