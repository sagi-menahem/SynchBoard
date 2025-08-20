import React, { useCallback, useEffect, useState, type ReactNode } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/Logger';

import { useAuth } from 'hooks/auth';
import * as userService from 'services/UserService';
import type { UserPreferences } from 'types/UserTypes';

import { PreferencesContext } from './PreferencesContext';

interface PreferencesProviderProps {
    children: ReactNode;
}

const defaultPreferences: UserPreferences = {
  chatBackgroundSetting: '#282828',
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
          chatBackgroundSetting: profile.chatBackgroundSetting || defaultPreferences.chatBackgroundSetting,
        });
      })
      .catch((error) => {
        logger.error('Failed to fetch user preferences', error);
      });
  }, []);

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
        throw error;
      });
  };

  const value = {
    preferences,
    updatePreferences,
  };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};
