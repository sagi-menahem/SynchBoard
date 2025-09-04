
import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import type { LanguagePreferences } from 'features/settings/types/UserTypes';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';

const GUEST_LANGUAGE_KEY = 'guest-language';

let isLoadingLanguagePrefs = false;
let languagePrefsCache: LanguagePreferences | null = null;
let languagePrefsPromise: Promise<LanguagePreferences> | null = null;

export const useLanguageSync = () => {
  const { i18n } = useTranslation(['common']);
  const { token, isInitializing: authLoading } = useAuth();
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  const loadUserLanguage = useCallback(async (): Promise<LanguagePreferences | null> => {
    if (!token) {
      return null;
    }

    if (languagePrefsCache) {
      return languagePrefsCache;
    }

    if (isLoadingLanguagePrefs && languagePrefsPromise) {
      return await languagePrefsPromise;
    }
    isLoadingLanguagePrefs = true;
    languagePrefsPromise = userService.getLanguagePreferences();

    try {
      const languagePrefs = await languagePrefsPromise;

      languagePrefsCache = languagePrefs;

      if (languagePrefs.preferredLanguage && i18n.language !== languagePrefs.preferredLanguage) {
        await i18n.changeLanguage(languagePrefs.preferredLanguage);
      }

      return languagePrefs;
    } catch (error) {
      logger.error('Failed to load user language preferences:', error);
      return null;
    } finally {
      isLoadingLanguagePrefs = false;
      setIsLanguageLoaded(true);
    }
  }, [token, i18n]);

  const switchToGuestLanguage = useCallback(() => {
    const guestLanguage = localStorage.getItem(GUEST_LANGUAGE_KEY) ?? 'en';
    if (i18n.language !== guestLanguage) {
      void i18n.changeLanguage(guestLanguage);
    }
  }, [i18n]);

  useEffect(() => {
    if (!token) {
      languagePrefsCache = null;
      languagePrefsPromise = null;
      setIsLanguageLoaded(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (token) {
      void loadUserLanguage();
    } else {
      switchToGuestLanguage();
      setIsLanguageLoaded(true);
    }
  }, [token, authLoading, loadUserLanguage, switchToGuestLanguage]);

  const setGuestLanguage = (language: 'en' | 'he') => {
    localStorage.setItem(GUEST_LANGUAGE_KEY, language);
    if (!token) {
      void i18n.changeLanguage(language);
    }
  };

  const updateLanguagePreference = useCallback(
    async (language: 'en' | 'he') => {
      if (!token) {
        return;
      }

      try {
        languagePrefsCache = null;

        const updatedPrefs = await userService.updateLanguagePreferences({
          preferredLanguage: language,
        });

        languagePrefsCache = updatedPrefs;

        if (i18n.language !== language) {
          await i18n.changeLanguage(language);
        }

        return updatedPrefs;
      } catch (error) {
        logger.error('Failed to update language preference:', error);
        throw error;
      }
    },
    [token, i18n],
  );

  return {
    setGuestLanguage,
    updateLanguagePreference,
    loadUserLanguage,
    isLanguageLoaded,
  };
};
