import { WEBSOCKET_TOPICS } from 'constants';

import React, { createContext, useContext, useCallback, useReducer, useEffect } from 'react';

import logger from 'utils/logger';

import type { LayoutMode } from 'components/board/workspace/BoardWorkspace';
import { useAuth } from 'hooks/auth';
import { useSocketSubscription } from 'hooks/common/useSocket';
import * as userService from 'services/userService';
import type { UserUpdateDTO } from 'types/WebSocketTypes';


export interface CanvasUserPreferences {
  canvasZoomLevel: number;
  canvasChatSplitRatio: number;
  layoutMode: LayoutMode;
}

interface CanvasPreferencesState {
  preferences: CanvasUserPreferences;
  isLoading: boolean;
  error: string | null;
}

type CanvasPreferencesAction = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: CanvasUserPreferences }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_ZOOM'; payload: number }
  | { type: 'UPDATE_SPLIT_RATIO'; payload: number }
  | { type: 'UPDATE_LAYOUT_MODE'; payload: LayoutMode }
  | { type: 'RESET_ERROR' };

const initialState: CanvasPreferencesState = {
  preferences: {
    canvasZoomLevel: 100,
    canvasChatSplitRatio: 70,
    layoutMode: 'balanced',
  },
  isLoading: false,
  error: null,
};

const canvasPreferencesReducer = (
  state: CanvasPreferencesState,
  action: CanvasPreferencesAction,
): CanvasPreferencesState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, isLoading: false, preferences: action.payload, error: null };
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'UPDATE_ZOOM':
      return {
        ...state,
        preferences: { ...state.preferences, canvasZoomLevel: action.payload },
      };
    case 'UPDATE_SPLIT_RATIO':
      return {
        ...state,
        preferences: { ...state.preferences, canvasChatSplitRatio: action.payload },
      };
    case 'UPDATE_LAYOUT_MODE':
      return {
        ...state,
        preferences: { ...state.preferences, layoutMode: action.payload },
      };
    case 'RESET_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface CanvasPreferencesContextType {
  preferences: CanvasUserPreferences;
  isLoading: boolean;
  error: string | null;
  updateZoomLevel: (zoomLevel: number) => Promise<void>;
  updateSplitRatio: (splitRatio: number) => Promise<void>;
  updateLayoutMode: (layoutMode: LayoutMode) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const CanvasPreferencesContext = createContext<CanvasPreferencesContextType | undefined>(undefined);

interface CanvasPreferencesProviderProps {
  children: React.ReactNode;
}

export const CanvasPreferencesProvider: React.FC<CanvasPreferencesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(canvasPreferencesReducer, initialState);
  const { userEmail, isAuthenticated } = useAuth();

  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      logger.debug('[CanvasPreferences] User not authenticated, skipping preferences load');
      return;
    }
    
    try {
      dispatch({ type: 'LOAD_START' });
      const canvasPrefs = await userService.getCanvasPreferences();
      
      const preferences: CanvasUserPreferences = {
        canvasZoomLevel: canvasPrefs.canvasZoomLevel,
        canvasChatSplitRatio: canvasPrefs.canvasChatSplitRatio,
        layoutMode: 'balanced', // Default layout mode, not stored in backend yet
      };
      
      dispatch({ type: 'LOAD_SUCCESS', payload: preferences });
    } catch (error) {
      logger.error('Failed to load canvas preferences:', error);
      dispatch({ type: 'LOAD_ERROR', payload: 'Failed to load preferences' });
    }
  }, [isAuthenticated]);

  const updateZoomLevel = useCallback(async (zoomLevel: number) => {
    try {
      dispatch({ type: 'UPDATE_ZOOM', payload: zoomLevel });
      await userService.updateCanvasPreferences({ canvasZoomLevel: zoomLevel });
    } catch (error) {
      logger.error('Failed to update zoom level:', error);
      await refreshPreferences(); // Revert on error
      throw error;
    }
  }, [refreshPreferences]);

  const updateSplitRatio = useCallback(async (splitRatio: number) => {
    try {
      dispatch({ type: 'UPDATE_SPLIT_RATIO', payload: splitRatio });
      await userService.updateCanvasPreferences({ canvasChatSplitRatio: splitRatio });
    } catch (error) {
      logger.error('Failed to update split ratio:', error);
      await refreshPreferences(); // Revert on error
      throw error;
    }
  }, [refreshPreferences]);

  const updateLayoutMode = useCallback(async (layoutMode: LayoutMode) => {
    dispatch({ type: 'UPDATE_LAYOUT_MODE', payload: layoutMode });
    // Layout mode is stored locally only for now
  }, []);

  const handleCanvasSettingsUpdate = useCallback(
    (message: UserUpdateDTO) => {
      if (message.updateType === 'CANVAS_SETTINGS_CHANGED') {
        logger.debug('[CanvasPreferences] Canvas settings changed via WebSocket. Refreshing preferences...');
        refreshPreferences();
      }
    },
    [refreshPreferences],
  );

  useSocketSubscription(
    userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '',
    handleCanvasSettingsUpdate,
    'user',
  );

  useEffect(() => {
    if (isAuthenticated) {
      refreshPreferences();
    }
  }, [isAuthenticated, refreshPreferences]);

  const value: CanvasPreferencesContextType = {
    preferences: state.preferences,
    isLoading: state.isLoading,
    error: state.error,
    updateZoomLevel,
    updateSplitRatio,
    updateLayoutMode,
    refreshPreferences,
  };

  return <CanvasPreferencesContext.Provider value={value}>{children}</CanvasPreferencesContext.Provider>;
};

export const useCanvasPreferences = (): CanvasPreferencesContextType => {
  const context = useContext(CanvasPreferencesContext);
  if (context === undefined) {
    throw new Error('useCanvasPreferences must be used within a CanvasPreferencesProvider');
  }
  return context;
};