import { useAuth } from 'features/auth/hooks';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { UserUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import { useCallback, useEffect, useReducer } from 'react';
import { WEBSOCKET_TOPICS } from 'shared/constants/ApiConstants';

import {
  CanvasPreferencesService,
  type CanvasPreferences,
  type LayoutMode,
} from '../services/canvasPreferencesService';

/**
 * State interface for managing canvas preferences with loading and error states.
 */
export interface CanvasPreferencesState {
  // Current canvas preferences configuration
  preferences: CanvasPreferences;
  // Loading state indicator for asynchronous preference operations
  isLoading: boolean;
  // Error message string for failed preference operations, null when no error
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

/**
 * Custom hook for managing canvas layout preferences with real-time synchronization and error handling.
 * Provides comprehensive state management for canvas split ratios, layout modes, and preference persistence.
 * Integrates with WebSocket subscriptions for real-time preference updates across multiple clients.
 * Implements optimistic updates with rollback functionality and proper authentication-aware operations.
 * Uses reducer pattern for complex state management and provides automatic preference loading on authentication.
 *
 * @returns Object containing current preferences, loading states, and preference update functions
 */
export function useCanvasPreferencesService() {
  const [state, dispatch] = useReducer(canvasPreferencesReducer, initialState);
  const { token, userEmail } = useAuth();
  const isAuthenticated = !!token;

  // Memoize to prevent infinite re-renders when used in useEffect dependencies
  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    dispatch({ type: 'LOAD_START' });

    try {
      const preferences = await CanvasPreferencesService.fetchPreferences();
      dispatch({ type: 'LOAD_SUCCESS', payload: preferences });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load canvas preferences';
      dispatch({ type: 'LOAD_ERROR', payload: errorMessage });
    }
  }, [isAuthenticated]);

  // Memoize to prevent component re-renders when split ratio function is passed as prop
  const updateSplitRatio = useCallback(
    async (splitRatio: number) => {
      // Optimistically update local state for immediate UI feedback
      dispatch({ type: 'UPDATE_SPLIT_RATIO', payload: splitRatio });

      if (isAuthenticated) {
        try {
          await CanvasPreferencesService.updateSplitRatio(splitRatio);
        } catch (error) {
          // Refresh from server on failure to ensure state consistency
          await refreshPreferences();
          throw error;
        }
      }
    },
    [isAuthenticated, refreshPreferences],
  );

  const updateLayoutMode = async (layoutMode: LayoutMode) => {
    dispatch({ type: 'UPDATE_LAYOUT_MODE', payload: layoutMode });
  };

  // Memoize to avoid recreation on every render when function is passed to child components
  const updateCanvasPreferences = useCallback(
    async (newPrefs: Partial<CanvasPreferences>) => {
      if (!isAuthenticated) {
        return;
      }

      // Store previous state for potential rollback on error
      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        await CanvasPreferencesService.updatePreferences(newPrefs);
      } catch (error) {
        // Rollback to previous state and set error on failure
        dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
        dispatch({ type: 'LOAD_ERROR', payload: 'Failed to save canvas preferences' });
        throw error;
      }
    },
    [isAuthenticated, state.preferences],
  );

  const resetError = () => {
    dispatch({ type: 'RESET_ERROR' });
  };

  // Memoize to maintain stable reference for WebSocket subscription callback
  const handleCanvasSettingsUpdate = useCallback(
    (message: UserUpdateDTO) => {
      // Handle real-time canvas settings changes from other clients
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
