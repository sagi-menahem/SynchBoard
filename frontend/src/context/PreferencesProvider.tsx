import React, { useCallback, useEffect, useState, type ReactNode } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import * as userService from 'services/userService';
import type { UserPreferences } from 'types/UserTypes';

import { PreferencesContext } from './PreferencesContext';

interface PreferencesProviderProps {
    children: ReactNode;
}

const defaultPreferences: UserPreferences = {
  boardBackgroundSetting: '#282828',
};

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const { t } = useTranslation();
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
        // Only show error toast if preferences are actively being used by user
        if (document.location.pathname.includes('/settings')) {
          toast.error(t('errors.preferences.fetch'));
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
        toast.success(t('success.preferences.update'));
      })
      .catch((error) => {
        logger.error('Failed to save preferences', error);
        setPreferences(oldPrefs);
        toast.error(t('errors.preferences.update'));
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
