import React, { useCallback, useEffect, useState, type ReactNode } from 'react';

import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import type { UserPreferences } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';


import { PreferencesContext } from './PreferencesContext';

interface PreferencesProviderProps {
    children: ReactNode;
}

const defaultPreferences: UserPreferences = {
  boardBackgroundSetting: '#282828',
};

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const { t } = useTranslation(['settings', 'common']);
  const { token } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  const fetchAndSetUserPreferences = useCallback(() => {
    userService
      .getUserProfile()
      .then((profile) => {
        setPreferences({
          boardBackgroundSetting: profile.boardBackgroundSetting || defaultPreferences.boardBackgroundSetting,
        });
      })
      .catch((error) => {
        logger.error('Failed to fetch user preferences', error);
        if (document.location.pathname.includes('/settings')) {
          toast.error(t('settings:errors.preferences.fetch'));
        }
      });
  }, [t]);

  useEffect(() => {
    if (token) {
      fetchAndSetUserPreferences();
    } else {
      setPreferences(defaultPreferences);
    }
  }, [token, fetchAndSetUserPreferences]);

  const updatePreferences = (newPrefs: UserPreferences): Promise<void> => {
    const oldPrefs = preferences;
    setPreferences(newPrefs);

    return userService
      .updateUserPreferences(newPrefs)
      .then(() => {
        toast.success(t('settings:success.preferences.update'));
      })
      .catch((error) => {
        logger.error('Failed to save preferences', error);
        setPreferences(oldPrefs);
        toast.error(t('settings:errors.preferences.update'));
        throw error;
      });
  };

  const updatePreferencesSilent = (newPrefs: UserPreferences): Promise<void> => {
    const oldPrefs = preferences;
    setPreferences(newPrefs);

    return userService
      .updateUserPreferences(newPrefs)
      .then(() => {
        // Success - no toast notification
      })
      .catch((error) => {
        logger.error('Failed to save preferences silently', error);
        setPreferences(oldPrefs);
        throw error;
      });
  };

  const value = {
    preferences,
    updatePreferences,
    updatePreferencesSilent,
  };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};
