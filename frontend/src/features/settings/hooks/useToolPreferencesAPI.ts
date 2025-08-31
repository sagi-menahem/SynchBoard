import { useCallback, useEffect, useReducer } from 'react';

import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import type { Tool } from 'shared/types/CommonTypes';
import logger from 'shared/utils/logger';

export interface ToolPreferences {
  defaultTool: Tool;
  defaultStrokeColor: string;
  defaultStrokeWidth: number;
}

export interface ToolPreferencesState {
  preferences: ToolPreferences;
  isLoading: boolean;
  error: string | null;
}

// Action types for reducer
type ToolPreferencesAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: ToolPreferences }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_TOOL'; payload: Tool }
  | { type: 'UPDATE_STROKE_COLOR'; payload: string }
  | { type: 'UPDATE_STROKE_WIDTH'; payload: number }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<ToolPreferences> }
  | { type: 'RESET_ERROR' };

// Default tool preferences
const defaultToolPreferences: ToolPreferences = {
  defaultTool: 'brush',
  defaultStrokeColor: '#FFFFFF',
  defaultStrokeWidth: 3,
};

// Initial state
const initialState: ToolPreferencesState = {
  preferences: defaultToolPreferences,
  isLoading: false,
  error: null,
};

// Reducer function
const toolPreferencesReducer = (
  state: ToolPreferencesState,
  action: ToolPreferencesAction,
): ToolPreferencesState => {
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

export const useToolPreferencesAPI = () => {
  const [state, dispatch] = useReducer(toolPreferencesReducer, initialState);
  const { token } = useAuth();
  const isAuthenticated = !!token;

  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    dispatch({ type: 'LOAD_START' });
    
    try {
      const toolPrefs = await userService.getToolPreferences();
      dispatch({ type: 'LOAD_SUCCESS', payload: toolPrefs });
    } catch (error) {
      logger.error('Failed to load tool preferences:', error);
      dispatch({ type: 'LOAD_ERROR', payload: 'Failed to load tool preferences' });
    }
  }, [isAuthenticated]);

  const updateTool = useCallback(
    async (tool: Tool) => {
      if (!isAuthenticated) {return;}

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
        throw error;
      }
    },
    [isAuthenticated, state.preferences],
  );

  const updateStrokeColor = useCallback(
    async (color: string) => {
      if (!isAuthenticated) {return;}

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
        throw error;
      }
    },
    [isAuthenticated, state.preferences],
  );

  const updateStrokeWidth = useCallback(
    async (width: number) => {
      if (!isAuthenticated) {return;}

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
        throw error;
      }
    },
    [isAuthenticated, state.preferences],
  );

  const updateToolPreferences = useCallback(
    async (newPrefs: Partial<ToolPreferences>) => {
      if (!isAuthenticated) {return;}

      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        const updatedPrefs = { ...state.preferences, ...newPrefs };
        await userService.updateToolPreferences(updatedPrefs);
      } catch (error) {
        logger.error('Failed to save tool preferences:', error);
        dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
        dispatch({ type: 'LOAD_ERROR', payload: 'Failed to save tool preferences' });
        throw error;
      }
    },
    [isAuthenticated, state.preferences],
  );

  const resetError = useCallback(() => {
    dispatch({ type: 'RESET_ERROR' });
  }, []);

  // Load preferences on mount and auth change
  useEffect(() => {
    if (isAuthenticated) {
      void refreshPreferences();
    }
  }, [isAuthenticated, refreshPreferences]);

  return {
    preferences: state.preferences,
    isLoading: state.isLoading,
    error: state.error,
    updateTool,
    updateStrokeColor,
    updateStrokeWidth,
    updateToolPreferences,
    refreshPreferences,
    resetError,
  };
};