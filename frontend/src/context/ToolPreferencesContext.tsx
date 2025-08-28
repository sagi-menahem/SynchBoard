import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import * as userService from 'services/userService';
import type { Tool } from 'types/CommonTypes';

export interface ToolUserPreferences {
  defaultTool: Tool;
  defaultStrokeColor: string;
  defaultStrokeWidth: number;
}

interface ToolPreferencesState {
  preferences: ToolUserPreferences;
  isLoading: boolean;
  error: string | null;
}

type ToolPreferencesAction = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: ToolUserPreferences }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_TOOL'; payload: Tool }
  | { type: 'UPDATE_STROKE_COLOR'; payload: string }
  | { type: 'UPDATE_STROKE_WIDTH'; payload: number }
  | { type: 'RESET_ERROR' };

const initialState: ToolPreferencesState = {
  preferences: {
    defaultTool: 'brush',
    defaultStrokeColor: '#FFFFFF',
    defaultStrokeWidth: 3,
  },
  isLoading: false,
  error: null,
};

const toolPreferencesReducer = (
  state: ToolPreferencesState,
  action: ToolPreferencesAction,
): ToolPreferencesState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, isLoading: false, preferences: action.payload, error: null };
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
    case 'RESET_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export interface ToolPreferencesContextType {
  preferences: ToolUserPreferences;
  isLoading: boolean;
  error: string | null;
  updateTool: (tool: Tool) => Promise<void>;
  updateStrokeColor: (color: string) => Promise<void>;
  updateStrokeWidth: (width: number) => Promise<void>;
  resetError: () => void;
}

const ToolPreferencesContext = createContext<ToolPreferencesContextType | undefined>(undefined);

export const useToolPreferences = (): ToolPreferencesContextType => {
  const context = useContext(ToolPreferencesContext);
  if (context === undefined) {
    throw new Error('useToolPreferences must be used within a ToolPreferencesProvider');
  }
  return context;
};

interface ToolPreferencesProviderProps {
  children: React.ReactNode;
}

export const ToolPreferencesProvider: React.FC<ToolPreferencesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(toolPreferencesReducer, initialState);
  const { token } = useAuth();
  const isAuthenticated = !!token;

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadPreferences = async () => {
      dispatch({ type: 'LOAD_START' });
      try {
        const toolPreferences = await userService.getToolPreferences();
        dispatch({ 
          type: 'LOAD_SUCCESS', 
          payload: {
            defaultTool: toolPreferences.defaultTool,
            defaultStrokeColor: toolPreferences.defaultStrokeColor,
            defaultStrokeWidth: toolPreferences.defaultStrokeWidth,
          },
        });
      } catch (error) {
        logger.error('Failed to load tool preferences:', error);
        dispatch({ type: 'LOAD_ERROR', payload: 'Failed to load tool preferences' });
      }
    };

    loadPreferences();
  }, [isAuthenticated]);

  const updateTool = useCallback(async (tool: Tool) => {
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
  }, [isAuthenticated, state.preferences]);

  const updateStrokeColor = useCallback(async (color: string) => {
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
  }, [isAuthenticated, state.preferences]);

  const updateStrokeWidth = useCallback(async (width: number) => {
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
  }, [isAuthenticated, state.preferences]);

  const resetError = () => {
    dispatch({ type: 'RESET_ERROR' });
  };

  const value: ToolPreferencesContextType = {
    preferences: state.preferences,
    isLoading: state.isLoading,
    error: state.error,
    updateTool,
    updateStrokeColor,
    updateStrokeWidth,
    resetError,
  };

  return (
    <ToolPreferencesContext.Provider value={value}>
      {children}
    </ToolPreferencesContext.Provider>
  );
};