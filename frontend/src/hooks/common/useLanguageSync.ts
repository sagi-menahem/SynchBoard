import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import * as userService from 'services/userService';
import type { LanguagePreferences } from 'types/UserTypes';

const GUEST_LANGUAGE_KEY = 'guest-language';

// Global state to prevent race conditions between components
let isLoadingLanguagePrefs = false;
let languagePrefsCache: LanguagePreferences | null = null;
let languagePrefsPromise: Promise<LanguagePreferences> | null = null;

export const useLanguageSync = () => {
  const { i18n } = useTranslation();
  const { token, isInitializing: authLoading } = useAuth();
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  const loadUserLanguage = useCallback(async (): Promise<LanguagePreferences | null> => {
    if (!token) return null;

    // Return cached result if available
    if (languagePrefsCache) {
      return languagePrefsCache;
    }

    // If already loading, wait for existing promise
    if (isLoadingLanguagePrefs && languagePrefsPromise) {
      return await languagePrefsPromise;
    }

    // Set loading state and create new promise
    isLoadingLanguagePrefs = true;
    languagePrefsPromise = userService.getLanguagePreferences();

    try {
      const languagePrefs = await languagePrefsPromise;
      
      // Cache the result
      languagePrefsCache = languagePrefs;
      
      if (languagePrefs.preferredLanguage && i18n.language !== languagePrefs.preferredLanguage) {
        logger.debug(`Loading user language preference: ${languagePrefs.preferredLanguage}`);
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
    const guestLanguage = localStorage.getItem(GUEST_LANGUAGE_KEY) || 'en';
    if (i18n.language !== guestLanguage) {
      logger.debug(`Switching to guest language: ${guestLanguage}`);
      i18n.changeLanguage(guestLanguage);
    }
  }, [i18n]);

  // Clear cache when user logs out
  useEffect(() => {
    if (!token) {
      languagePrefsCache = null;
      languagePrefsPromise = null;
      setIsLanguageLoaded(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;

    if (token) {
      loadUserLanguage();
    } else {
      switchToGuestLanguage();
      setIsLanguageLoaded(true);
    }
  }, [token, authLoading, loadUserLanguage, switchToGuestLanguage]);

  const setGuestLanguage = useCallback((language: 'en' | 'he') => {
    localStorage.setItem(GUEST_LANGUAGE_KEY, language);
    if (!token) {
      i18n.changeLanguage(language);
    }
  }, [i18n, token]);

  const updateLanguagePreference = useCallback(async (language: 'en' | 'he') => {
    if (!token) return;

    try {
      // Clear cache before updating
      languagePrefsCache = null;
      
      const updatedPrefs = await userService.updateLanguagePreferences({ preferredLanguage: language });
      
      // Update cache with new value
      languagePrefsCache = updatedPrefs;
      
      // Change language immediately
      if (i18n.language !== language) {
        await i18n.changeLanguage(language);
      }
      
      return updatedPrefs;
    } catch (error) {
      logger.error('Failed to update language preference:', error);
      throw error;
    }
  }, [token, i18n]);

  return {
    setGuestLanguage,
    updateLanguagePreference,
    loadUserLanguage,
    isLanguageLoaded,
  };
};