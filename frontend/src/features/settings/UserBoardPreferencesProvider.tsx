import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';

export interface UserBoardPreferences {
  boardBackgroundSetting: string;
}

export interface UserBoardPreferencesState {
  preferences: UserBoardPreferences;
  isLoading: boolean;
  error: string | null;
}

export interface UserBoardPreferencesContextType {
  preferences: UserBoardPreferences;
  isLoading: boolean;
  error: string | null;
  updateBoardBackground: (background: string) => Promise<void>;
  updatePreferences: (preferences: Partial<UserBoardPreferences>) => Promise<void>;
  updatePreferencesSilent: (preferences: Partial<UserBoardPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
  resetError: () => void;
}

// Action types for reducer
type UserBoardPreferencesAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: UserBoardPreferences }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_BOARD_BACKGROUND'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserBoardPreferences> }
  | { type: 'RESET_ERROR' };

// Default board preferences
const defaultBoardPreferences: UserBoardPreferences = {
  boardBackgroundSetting: '#282828',
};

// Initial state
const initialState: UserBoardPreferencesState = {
  preferences: defaultBoardPreferences,
  isLoading: false,
  error: null,
};

// Reducer function
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

const UserBoardPreferencesContext = createContext<UserBoardPreferencesContextType | undefined>(undefined);

interface UserBoardPreferencesProviderProps {
  children: React.ReactNode;
}

export const UserBoardPreferencesProvider: React.FC<UserBoardPreferencesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userBoardPreferencesReducer, initialState);
  const { t } = useTranslation(['settings', 'common']);
  const { token } = useAuth();
  const isAuthenticated = !!token;

  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    dispatch({ type: 'LOAD_START' });
    
    try {
      const profile = await userService.getUserProfile();
      const preferences: UserBoardPreferences = {
        boardBackgroundSetting: profile.boardBackgroundSetting ?? defaultBoardPreferences.boardBackgroundSetting,
      };
      dispatch({ type: 'LOAD_SUCCESS', payload: preferences });
    } catch (error) {
      logger.error('Failed to load user board preferences:', error);
      dispatch({ type: 'LOAD_ERROR', payload: 'Failed to load board preferences' });
      
      // Only show toast on settings page
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
          await userService.updateUserPreferences({
            boardBackgroundSetting: background,
          });
          toast.success(t('settings:success.preferences.update'));
        } catch (error) {
          logger.error('Failed to save board background preference:', error);
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
      if (!isAuthenticated) {return;}

      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        if (newPrefs.boardBackgroundSetting !== undefined) {
          await userService.updateUserPreferences({
            boardBackgroundSetting: newPrefs.boardBackgroundSetting,
          });
        }
        toast.success(t('settings:success.preferences.update'));
      } catch (error) {
        logger.error('Failed to save board preferences:', error);
        dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
        toast.error(t('settings:errors.preferences.update'));
        throw error;
      }
    },
    [isAuthenticated, state.preferences, t],
  );

  const updatePreferencesSilent = useCallback(
    async (newPrefs: Partial<UserBoardPreferences>) => {
      if (!isAuthenticated) {return;}

      const oldPrefs = state.preferences;
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        if (newPrefs.boardBackgroundSetting !== undefined) {
          await userService.updateUserPreferences({
            boardBackgroundSetting: newPrefs.boardBackgroundSetting,
          });
        }
      } catch (error) {
        logger.error('Failed to save board preferences silently:', error);
        dispatch({ type: 'UPDATE_PREFERENCES', payload: oldPrefs });
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

  const value: UserBoardPreferencesContextType = {
    preferences: state.preferences,
    isLoading: state.isLoading,
    error: state.error,
    updateBoardBackground,
    updatePreferences,
    updatePreferencesSilent,
    refreshPreferences,
    resetError,
  };

  return <UserBoardPreferencesContext.Provider value={value}>{children}</UserBoardPreferencesContext.Provider>;
};

// Hook to use the context
export const useUserBoardPreferences = (): UserBoardPreferencesContextType => {
  const context = useContext(UserBoardPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserBoardPreferences must be used within a UserBoardPreferencesProvider');
  }
  return context;
};

// Backward compatibility hook
export const usePreferences = () => {
  const { preferences, updatePreferences, updatePreferencesSilent } = useUserBoardPreferences();
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