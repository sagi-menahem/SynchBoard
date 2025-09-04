import { useCallback, useEffect, useReducer } from 'react';

import { useAuth } from 'features/auth/hooks';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import {
  UserPreferencesService,
  type UserBoardPreferences,
} from '../services/userPreferencesService';

export interface UserBoardPreferencesState {
  preferences: UserBoardPreferences;
  isLoading: boolean;
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

export function useUserBoardPreferencesService() {
  const [state, dispatch] = useReducer(userBoardPreferencesReducer, initialState);
  const { t } = useTranslation(['settings']);
  const { token } = useAuth();
  const isAuthenticated = !!token;

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

      if (document.location.pathname.includes('/settings')) {
        toast.error(t('settings:errors.preferences.fetch'));
      }
    }
  }, [isAuthenticated, t]);

  const updateBoardBackground = useCallback(
    async (background: string) => {
      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_BOARD_BACKGROUND', payload: background });

      if (isAuthenticated) {
        try {
          await UserPreferencesService.updateBoardBackground(background);
          toast.success(t('settings:success.preferences.update'));
        } catch (error) {
          dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
          toast.error(t('settings:errors.preferences.update'));
          throw error;
        }
      }
    },
    [isAuthenticated, state.preferences, t],
  );

  const updatePreferences = useCallback(
    async (newPrefs: Partial<UserBoardPreferences>) => {
      if (!isAuthenticated) {
        return;
      }

      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        await UserPreferencesService.updatePreferences(newPrefs);
        toast.success(t('settings:success.preferences.update'));
      } catch (error) {
        dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
        toast.error(t('settings:errors.preferences.update'));
        throw error;
      }
    },
    [isAuthenticated, state.preferences, t],
  );

  const updatePreferencesSilent = useCallback(
    async (newPrefs: Partial<UserBoardPreferences>) => {
      if (!isAuthenticated) {
        return;
      }

      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        await UserPreferencesService.updatePreferences(newPrefs);
      } catch (error) {
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
