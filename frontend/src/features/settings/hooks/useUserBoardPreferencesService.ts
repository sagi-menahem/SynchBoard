import { useAuth } from 'features/auth/hooks';
import { useCallback, useEffect, useReducer } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import {
  UserPreferencesService,
  type UserBoardPreferences,
} from '../services/userPreferencesService';

/**
 * State interface for managing user board preferences with loading and error states.
 */
export interface UserBoardPreferencesState {
  // Current user board preferences configuration
  preferences: UserBoardPreferences;
  // Loading state indicator for asynchronous preference operations
  isLoading: boolean;
  // Error message string for failed preference operations, null when no error
  error: string | null;
}

type UserBoardPreferencesAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: UserBoardPreferences }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_BOARD_BACKGROUND'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserBoardPreferences> }
  | { type: 'RESET_ERROR' };

const initialState: UserBoardPreferencesState = {
  preferences: UserPreferencesService.getDefaultPreferences(),
  isLoading: false,
  error: null,
};

const userBoardPreferencesReducer = (
  state: UserBoardPreferencesState,
  action: UserBoardPreferencesAction,
): UserBoardPreferencesState => {
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
    case 'UPDATE_BOARD_BACKGROUND':
      return {
        ...state,
        preferences: { ...state.preferences, boardBackgroundSetting: action.payload },
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
 * Custom hook for managing user board preferences with optimistic updates and comprehensive error handling.
 * Provides board-specific preference management including background settings, visual customizations,
 * and user interface preferences with persistent storage for authenticated users.
 * Implements reducer pattern for complex state management with optimistic UI updates and rollback functionality.
 * Includes both explicit toast notifications and silent update modes for different user interaction contexts.
 *
 * @returns Object containing current board preferences, loading states, and preference update functions
 */
export function useUserBoardPreferencesService() {
  const [state, dispatch] = useReducer(userBoardPreferencesReducer, initialState);
  const { t } = useTranslation(['settings']);
  const { token } = useAuth();
  const isAuthenticated = !!token;

  // Memoize to prevent infinite loops when used in useEffect dependency arrays
  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    dispatch({ type: 'LOAD_START' });

    try {
      const preferences = await UserPreferencesService.fetchPreferences();
      dispatch({ type: 'LOAD_SUCCESS', payload: preferences });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load board preferences';
      dispatch({ type: 'LOAD_ERROR', payload: errorMessage });

      // Only show toast error if user is actively on settings page
      if (document.location.pathname.includes('/settings')) {
        toast.error(t('settings:errors.preferences.fetch'));
      }
    }
  }, [isAuthenticated, t]);

  // Memoize to prevent unnecessary re-renders when background update function is passed as prop
  const updateBoardBackground = useCallback(
    async (background: string) => {
      // Store previous state for potential rollback
      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_BOARD_BACKGROUND', payload: background });

      if (isAuthenticated) {
        try {
          await UserPreferencesService.updateBoardBackground(background);
          toast.success(t('settings:success.preferences.update'));
        } catch (error) {
          // Rollback to previous state and show error
          dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
          toast.error(t('settings:errors.preferences.update'));
          throw error;
        }
      }
    },
    [isAuthenticated, state.preferences, t],
  );

  // Memoize to maintain stable function reference for components consuming this hook
  const updatePreferences = useCallback(
    async (newPrefs: Partial<UserBoardPreferences>) => {
      if (!isAuthenticated) {
        return;
      }

      // Store current state for rollback on failure
      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        await UserPreferencesService.updatePreferences(newPrefs);
        toast.success(t('settings:success.preferences.update'));
      } catch (error) {
        // Restore previous state and notify user of failure
        dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
        toast.error(t('settings:errors.preferences.update'));
        throw error;
      }
    },
    [isAuthenticated, state.preferences, t],
  );

  // Memoize to avoid function recreation and provide stable reference for silent updates
  const updatePreferencesSilent = useCallback(
    async (newPrefs: Partial<UserBoardPreferences>) => {
      if (!isAuthenticated) {
        return;
      }

      // Store current state for silent rollback on failure
      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        await UserPreferencesService.updatePreferences(newPrefs);
      } catch (error) {
        // Silently restore previous state without user notification
        dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
        throw error;
      }
    },
    [isAuthenticated, state.preferences],
  );

  const resetError = () => {
    dispatch({ type: 'RESET_ERROR' });
  };

  useEffect(() => {
    if (isAuthenticated) {
      void refreshPreferences();
    }
  }, [isAuthenticated, refreshPreferences]);

  return {
    preferences: state.preferences,
    isLoading: state.isLoading,
    error: state.error,
    updateBoardBackground,
    updatePreferences,
    updatePreferencesSilent,
    refreshPreferences,
    resetError,
  };
}
