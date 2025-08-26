import { useCallback, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import * as userService from 'services/userService';

const GUEST_LANGUAGE_KEY = 'guest-language';

export const useLanguageSync = () => {
  const { i18n } = useTranslation();
  const { token, isLoading: authLoading } = useAuth();

  const loadUserLanguage = useCallback(async () => {
    if (!token) return;

    try {
      const languagePrefs = await userService.getLanguagePreferences();
      if (languagePrefs.preferredLanguage && i18n.language !== languagePrefs.preferredLanguage) {
        logger.debug(`Loading user language preference: ${languagePrefs.preferredLanguage}`);
        await i18n.changeLanguage(languagePrefs.preferredLanguage);
      }
    } catch (error) {
      logger.error('Failed to load user language preferences:', error);
    }
  }, [token, i18n]);

  const switchToGuestLanguage = useCallback(() => {
    const guestLanguage = localStorage.getItem(GUEST_LANGUAGE_KEY) || 'en';
    if (i18n.language !== guestLanguage) {
      logger.debug(`Switching to guest language: ${guestLanguage}`);
      i18n.changeLanguage(guestLanguage);
    }
  }, [i18n]);

  useEffect(() => {
    if (authLoading) return;

    if (token) {
      loadUserLanguage();
    } else {
      switchToGuestLanguage();
    }
  }, [token, authLoading, loadUserLanguage, switchToGuestLanguage]);

  const setGuestLanguage = useCallback((language: 'en' | 'he') => {
    localStorage.setItem(GUEST_LANGUAGE_KEY, language);
    if (!token) {
      i18n.changeLanguage(language);
    }
  }, [i18n, token]);

  return {
    setGuestLanguage,
  };
};