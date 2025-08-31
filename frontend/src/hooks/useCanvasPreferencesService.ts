import { useCallback, useEffect, useReducer } from 'react';

import { useAuth } from 'features/auth/hooks';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { UserUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import { WEBSOCKET_TOPICS } from 'shared/constants/ApiConstants';

import { CanvasPreferencesService, type CanvasPreferences, type LayoutMode } from 'services/canvasPreferencesService';

export interface CanvasPreferencesState {
  preferences: CanvasPreferences;
  isLoading: boolean;
  error: string | null;
}

type CanvasPreferencesAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: CanvasPreferences }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_SPLIT_RATIO'; payload: number }
  | { type: 'UPDATE_LAYOUT_MODE'; payload: LayoutMode }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<CanvasPreferences> }
  | { type: 'RESET_ERROR' };

const initialState: CanvasPreferencesState = {
  preferences: CanvasPreferencesService.getDefaultPreferences(),
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

export function useCanvasPreferencesService() {
  const [state, dispatch] = useReducer(canvasPreferencesReducer, initialState);
  const { token, userEmail } = useAuth();
  const isAuthenticated = !!token;

  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    dispatch({ type: 'LOAD_START' });
    
    try {
      const preferences = await CanvasPreferencesService.fetchPreferences();
      dispatch({ type: 'LOAD_SUCCESS', payload: preferences });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load canvas preferences';
      dispatch({ type: 'LOAD_ERROR', payload: errorMessage });
    }
  }, [isAuthenticated]);

  const updateSplitRatio = useCallback(
    async (splitRatio: number) => {
      dispatch({ type: 'UPDATE_SPLIT_RATIO', payload: splitRatio });

      if (isAuthenticated) {
        try {
          await CanvasPreferencesService.updateSplitRatio(splitRatio);
        } catch (error) {
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
      if (!isAuthenticated) {
        return;
      }

      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        await CanvasPreferencesService.updatePreferences(newPrefs);
      } catch (error) {
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

  return {
    preferences: state.preferences,
    isLoading: state.isLoading,
    error: state.error,
    updateSplitRatio,
    updateLayoutMode,
    updateCanvasPreferences,
    refreshPreferences,
    resetError,
  };
}