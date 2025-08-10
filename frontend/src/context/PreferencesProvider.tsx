import React, { useCallback, useEffect, useState, type ReactNode } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth/useAuth';
import * as userService from 'services/userService';
import type { UserPreferences } from 'types/user.types';

import { PreferencesContext } from './PreferencesContext';

interface PreferencesProviderProps {
    children: ReactNode;
}

const defaultPreferences: UserPreferences = {
    chatBackgroundSetting: '#282828',
    fontSizeSetting: 'medium',
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
                    fontSizeSetting: profile.fontSizeSetting || defaultPreferences.fontSizeSetting,
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
