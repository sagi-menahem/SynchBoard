import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  usePreferencesService,
  type PreferencesServiceAdapter,
} from 'shared/hooks/usePreferencesService';

import {
  UserPreferencesService,
  type UserBoardPreferences,
} from '../services/userPreferencesService';

// =============================================================================
// SERVICE ADAPTER
// =============================================================================

const userBoardPreferencesAdapter: PreferencesServiceAdapter<UserBoardPreferences> = {
  fetchPreferences: () => UserPreferencesService.fetchPreferences(),
  updatePreferences: (prefs) => UserPreferencesService.updatePreferences(prefs),
  getDefaultPreferences: () => UserPreferencesService.getDefaultPreferences(),
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Custom hook for managing user board preferences with optimistic updates and comprehensive error handling.
 * Provides board-specific preference management including background settings, visual customizations,
 * and user interface preferences with persistent storage for authenticated users.
 * Includes both explicit toast notifications and silent update modes for different user interaction contexts.
 *
 * @returns Object containing current board preferences, loading states, and preference update functions
 */
export function useUserBoardPreferencesService() {
  const { t } = useTranslation(['settings']);

  const {
    preferences,
    isLoading,
    error,
    refreshPreferences,
    updatePreferences: baseUpdatePreferences,
    updatePreferencesSilent,
    resetError,
    isAuthenticated,
  } = usePreferencesService({
    service: userBoardPreferencesAdapter,
    serviceName: 'board',
    fetchErrorMessage: 'Failed to load board preferences',
    updateErrorMessage: 'Failed to save board preferences',
  });

  // Update board background with toast notification
  const updateBoardBackground = useCallback(
    async (background: string) => {
      try {
        await baseUpdatePreferences({ boardBackgroundSetting: background });
        toast.success(t('settings:success.preferences.update'));
      } catch (error) {
        toast.error(t('settings:errors.preferences.update'));
        throw error;
      }
    },
    [baseUpdatePreferences, t],
  );

  // Update preferences with toast notification
  const updatePreferences = useCallback(
    async (newPrefs: Partial<UserBoardPreferences>) => {
      try {
        await baseUpdatePreferences(newPrefs);
        toast.success(t('settings:success.preferences.update'));
      } catch (error) {
        toast.error(t('settings:errors.preferences.update'));
        throw error;
      }
    },
    [baseUpdatePreferences, t],
  );

  return {
    preferences,
    isLoading,
    error,
    updateBoardBackground,
    updatePreferences,
    updatePreferencesSilent,
    refreshPreferences,
    resetError,
    isAuthenticated,
  };
}

// Re-export types for convenience
export type { UserBoardPreferences } from '../services/userPreferencesService';
