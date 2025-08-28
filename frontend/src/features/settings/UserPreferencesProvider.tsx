import React, { useCallback, useContext, useEffect, useReducer } from 'react';

import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { UserUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { WEBSOCKET_TOPICS } from 'shared/constants/ApiConstants';
import type { Tool } from 'shared/types/CommonTypes';
import logger from 'shared/utils/logger';

import {
  type LayoutMode,
  type UserPreferences,
  type UserPreferencesContextType,
  type UserPreferencesState,
  UserPreferencesContext,
} from './UserPreferencesContext';

// Action types for reducer
type UserPreferencesAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Partial<UserPreferences> }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'UPDATE_SPLIT_RATIO'; payload: number }
  | { type: 'UPDATE_LAYOUT_MODE'; payload: LayoutMode }
  | { type: 'UPDATE_TOOL'; payload: Tool }
  | { type: 'UPDATE_STROKE_COLOR'; payload: string }
  | { type: 'UPDATE_STROKE_WIDTH'; payload: number }
  | { type: 'UPDATE_BOARD_BACKGROUND'; payload: string }
  | { type: 'RESET_ERROR' };

// Default preferences
const defaultPreferences: UserPreferences = {
  boardBackgroundSetting: '#282828',
  canvasChatSplitRatio: 70,
  layoutMode: 'balanced',
  defaultTool: 'brush',
  defaultStrokeColor: '#FFFFFF',
  defaultStrokeWidth: 3,
};

// Initial state
const initialState: UserPreferencesState = {
  preferences: defaultPreferences,
  isLoading: false,
  error: null,
};

// Reducer function
const userPreferencesReducer = (
  state: UserPreferencesState,
  action: UserPreferencesAction,
): UserPreferencesState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
      
    case 'LOAD_SUCCESS':
      return {
        ...state,
        isLoading: false,
        preferences: { ...state.preferences, ...action.payload },
        error: null,
      };
      
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
      
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
        error: null,
      };
      
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
      
    case 'UPDATE_TOOL':
      return {
        ...state,
        preferences: { ...state.preferences, defaultTool: action.payload },
        error: null,
      };
      
    case 'UPDATE_STROKE_COLOR':
      return {
        ...state,
        preferences: { ...state.preferences, defaultStrokeColor: action.payload },
        error: null,
      };
      
    case 'UPDATE_STROKE_WIDTH':
      return {
        ...state,
        preferences: { ...state.preferences, defaultStrokeWidth: action.payload },
        error: null,
      };
      
    case 'UPDATE_BOARD_BACKGROUND':
      return {
        ...state,
        preferences: { ...state.preferences, boardBackgroundSetting: action.payload },
        error: null,
      };
      
    case 'RESET_ERROR':
      return { ...state, error: null };
      
    default:
      return state;
  }
};

interface UserPreferencesProviderProps {
  children: React.ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userPreferencesReducer, initialState);
  const { t } = useTranslation(['settings', 'common']);
  const { token, userEmail } = useAuth();
  const isAuthenticated = !!token;

  // Load all preferences
  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    dispatch({ type: 'LOAD_START' });
    
    try {
      // Load all preferences in parallel
      const [profile, canvasPrefs, toolPrefs] = await Promise.all([
        userService.getUserProfile(),
        userService.getCanvasPreferences(),
        userService.getToolPreferences(),
      ]);

      const preferences: Partial<UserPreferences> = {
        boardBackgroundSetting: profile.boardBackgroundSetting || defaultPreferences.boardBackgroundSetting,
        canvasChatSplitRatio: canvasPrefs.canvasChatSplitRatio,
        layoutMode: 'balanced', // Layout mode is client-side only for now
        defaultTool: toolPrefs.defaultTool,
        defaultStrokeColor: toolPrefs.defaultStrokeColor,
        defaultStrokeWidth: toolPrefs.defaultStrokeWidth,
      };

      dispatch({ type: 'LOAD_SUCCESS', payload: preferences });
    } catch (error) {
      logger.error('Failed to load user preferences:', error);
      dispatch({ type: 'LOAD_ERROR', payload: 'Failed to load preferences' });
      
      // Only show toast on settings page
      if (document.location.pathname.includes('/settings')) {
        toast.error(t('settings:errors.preferences.fetch'));
      }
    }
  }, [isAuthenticated, t]);

  // General preferences update with toast
  const updatePreferences = useCallback(
    async (newPrefs: Partial<UserPreferences>) => {
      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        // Update the appropriate service based on what changed
        const promises: Promise<unknown>[] = [];

        if (newPrefs.boardBackgroundSetting !== undefined) {
          promises.push(userService.updateUserPreferences({
            boardBackgroundSetting: newPrefs.boardBackgroundSetting,
          }));
        }

        if (newPrefs.canvasChatSplitRatio !== undefined) {
          promises.push(userService.updateCanvasPreferences({
            canvasChatSplitRatio: newPrefs.canvasChatSplitRatio,
          }));
        }

        if (
          newPrefs.defaultTool !== undefined ||
          newPrefs.defaultStrokeColor !== undefined ||
          newPrefs.defaultStrokeWidth !== undefined
        ) {
          promises.push(userService.updateToolPreferences({
            defaultTool: newPrefs.defaultTool ?? state.preferences.defaultTool,
            defaultStrokeColor: newPrefs.defaultStrokeColor ?? state.preferences.defaultStrokeColor,
            defaultStrokeWidth: newPrefs.defaultStrokeWidth ?? state.preferences.defaultStrokeWidth,
          }));
        }

        await Promise.all(promises);
        toast.success(t('settings:success.preferences.update'));
      } catch (error) {
        logger.error('Failed to save preferences:', error);
        dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
        toast.error(t('settings:errors.preferences.update'));
        throw error;
      }
    },
    [state.preferences, t],
  );

  // Silent preferences update (no toast)
  const updatePreferencesSilent = useCallback(
    async (newPrefs: Partial<UserPreferences>) => {
      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        // Update the appropriate service based on what changed
        const promises: Promise<unknown>[] = [];

        if (newPrefs.boardBackgroundSetting !== undefined) {
          promises.push(userService.updateUserPreferences({
            boardBackgroundSetting: newPrefs.boardBackgroundSetting,
          }));
        }

        if (newPrefs.canvasChatSplitRatio !== undefined) {
          promises.push(userService.updateCanvasPreferences({
            canvasChatSplitRatio: newPrefs.canvasChatSplitRatio,
          }));
        }

        if (
          newPrefs.defaultTool !== undefined ||
          newPrefs.defaultStrokeColor !== undefined ||
          newPrefs.defaultStrokeWidth !== undefined
        ) {
          promises.push(userService.updateToolPreferences({
            defaultTool: newPrefs.defaultTool ?? state.preferences.defaultTool,
            defaultStrokeColor: newPrefs.defaultStrokeColor ?? state.preferences.defaultStrokeColor,
            defaultStrokeWidth: newPrefs.defaultStrokeWidth ?? state.preferences.defaultStrokeWidth,
          }));
        }

        await Promise.all(promises);
      } catch (error) {
        logger.error('Failed to save preferences silently:', error);
        dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
        throw error;
      }
    },
    [state.preferences],
  );

  // Canvas preferences specific methods
  const updateSplitRatio = useCallback(
    async (splitRatio: number) => {
      try {
        dispatch({ type: 'UPDATE_SPLIT_RATIO', payload: splitRatio });
        await userService.updateCanvasPreferences({ canvasChatSplitRatio: splitRatio });
      } catch (error) {
        logger.error('Failed to update split ratio:', error);
        await refreshPreferences();
        throw error;
      }
    },
    [refreshPreferences],
  );

  const updateLayoutMode = useCallback(async (layoutMode: LayoutMode) => {
    // Layout mode is client-side only for now
    dispatch({ type: 'UPDATE_LAYOUT_MODE', payload: layoutMode });
  }, []);

  // Tool preferences specific methods
  const updateTool = useCallback(
    async (tool: Tool) => {
      if (!isAuthenticated) return;

      const previousTool = state.preferences.defaultTool;
      dispatch({ type: 'UPDATE_TOOL', payload: tool });

      try {
        await userService.updateToolPreferences({
          defaultTool: tool,
          defaultStrokeColor: state.preferences.defaultStrokeColor,
          defaultStrokeWidth: state.preferences.defaultStrokeWidth,
        });
      } catch (error) {
        logger.error('Failed to update tool preference:', error);
        dispatch({ type: 'UPDATE_TOOL', payload: previousTool });
        dispatch({ type: 'LOAD_ERROR', payload: 'Failed to save tool preference' });
      }
    },
    [isAuthenticated, state.preferences],
  );

  const updateStrokeColor = useCallback(
    async (color: string) => {
      if (!isAuthenticated) return;

      const previousColor = state.preferences.defaultStrokeColor;
      dispatch({ type: 'UPDATE_STROKE_COLOR', payload: color });

      try {
        await userService.updateToolPreferences({
          defaultTool: state.preferences.defaultTool,
          defaultStrokeColor: color,
          defaultStrokeWidth: state.preferences.defaultStrokeWidth,
        });
      } catch (error) {
        logger.error('Failed to update stroke color preference:', error);
        dispatch({ type: 'UPDATE_STROKE_COLOR', payload: previousColor });
        dispatch({ type: 'LOAD_ERROR', payload: 'Failed to save stroke color preference' });
      }
    },
    [isAuthenticated, state.preferences],
  );

  const updateStrokeWidth = useCallback(
    async (width: number) => {
      if (!isAuthenticated) return;

      const previousWidth = state.preferences.defaultStrokeWidth;
      dispatch({ type: 'UPDATE_STROKE_WIDTH', payload: width });

      try {
        await userService.updateToolPreferences({
          defaultTool: state.preferences.defaultTool,
          defaultStrokeColor: state.preferences.defaultStrokeColor,
          defaultStrokeWidth: width,
        });
      } catch (error) {
        logger.error('Failed to update stroke width preference:', error);
        dispatch({ type: 'UPDATE_STROKE_WIDTH', payload: previousWidth });
        dispatch({ type: 'LOAD_ERROR', payload: 'Failed to save stroke width preference' });
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

  // Load preferences on mount and auth change
  useEffect(() => {
    if (isAuthenticated) {
      refreshPreferences();
    } else {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: defaultPreferences });
    }
  }, [isAuthenticated, refreshPreferences]);

  const value: UserPreferencesContextType = {
    preferences: state.preferences,
    isLoading: state.isLoading,
    error: state.error,
    updatePreferences,
    updatePreferencesSilent,
    updateSplitRatio,
    updateLayoutMode,
    updateTool,
    updateStrokeColor,
    updateStrokeWidth,
    refreshPreferences,
    resetError,
  };

  return <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>;
};

// Hook to use the context
export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

// Backward compatibility hooks (to make migration easier)
export const usePreferences = () => {
  const { preferences, updatePreferences, updatePreferencesSilent } = useUserPreferences();
  return {
    preferences: {
      boardBackgroundSetting: preferences.boardBackgroundSetting,
    },
    updatePreferences: (newPrefs: { boardBackgroundSetting?: string | null }) =>
      updatePreferences({ boardBackgroundSetting: newPrefs.boardBackgroundSetting ?? '#282828' }),
    updatePreferencesSilent: (newPrefs: { boardBackgroundSetting?: string | null }) =>
      updatePreferencesSilent({ boardBackgroundSetting: newPrefs.boardBackgroundSetting ?? '#282828' }),
  };
};

export const useCanvasPreferences = () => {
  const { 
    preferences, 
    isLoading, 
    error, 
    updateSplitRatio, 
    updateLayoutMode, 
    refreshPreferences, 
  } = useUserPreferences();
  return {
    preferences: {
      canvasChatSplitRatio: preferences.canvasChatSplitRatio,
      layoutMode: preferences.layoutMode,
    },
    isLoading,
    error,
    updateSplitRatio,
    updateLayoutMode,
    refreshPreferences,
  };
};

export const useToolPreferences = () => {
  const { 
    preferences, 
    isLoading, 
    error, 
    updateTool, 
    updateStrokeColor, 
    updateStrokeWidth, 
    resetError, 
  } = useUserPreferences();
  return {
    preferences: {
      defaultTool: preferences.defaultTool,
      defaultStrokeColor: preferences.defaultStrokeColor,
      defaultStrokeWidth: preferences.defaultStrokeWidth,
    },
    isLoading,
    error,
    updateTool,
    updateStrokeColor,
    updateStrokeWidth,
    resetError,
  };
};