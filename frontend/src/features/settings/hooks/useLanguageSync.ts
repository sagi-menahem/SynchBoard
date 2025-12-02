import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import type { LanguagePreferences } from 'features/settings/types/UserTypes';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';

const GUEST_LANGUAGE_KEY = 'guest-language';

// Module-level state for caching and preventing concurrent requests
let isLoadingLanguagePrefs = false;
let languagePrefsCache: LanguagePreferences | null = null;
let languagePrefsPromise: Promise<LanguagePreferences> | null = null;

/**
 * Custom hook for synchronizing language preferences between authenticated and guest states.
 * Manages language preference persistence across authentication state changes with proper caching.
 * Handles both authenticated user language preferences stored on the server and guest preferences in localStorage.
 * Integrates with i18n system to provide seamless language switching with immediate UI updates.
 * Implements module-level caching to prevent duplicate API calls and ensure consistent language state.
 *
 * @returns Object containing language synchronization functions and loading state indicators
 */
export const useLanguageSync = () => {
  const { i18n } = useTranslation(['common']);
  const { token, isInitializing: authLoading } = useAuth();
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  // Memoize to prevent unnecessary re-creation when used in useEffect dependencies
  const loadUserLanguage = useCallback(async (): Promise<LanguagePreferences | null> => {
    if (!token) {
      return null;
    }

    // Return cached preferences if available to avoid redundant API calls
    if (languagePrefsCache) {
      return languagePrefsCache;
    }

    // Handle concurrent calls by reusing existing promise
    if (isLoadingLanguagePrefs && languagePrefsPromise) {
      return await languagePrefsPromise;
    }
    isLoadingLanguagePrefs = true;
    languagePrefsPromise = userService.getLanguagePreferences();

    try {
      const languagePrefs = await languagePrefsPromise;

      languagePrefsCache = languagePrefs;

      // Apply language preference to i18n if different from current setting
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

  // Memoize to maintain stable reference when passed to useEffect dependency array
  const switchToGuestLanguage = useCallback(() => {
    const guestLanguage = localStorage.getItem(GUEST_LANGUAGE_KEY) ?? 'en';
    if (i18n.language !== guestLanguage) {
      void i18n.changeLanguage(guestLanguage);
    }
  }, [i18n]);

  useEffect(() => {
    // Clear cache and reset state when user logs out
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

  // Memoize to prevent function recreation and avoid unnecessary child component re-renders
  const updateLanguagePreference = useCallback(
    async (language: 'en' | 'he') => {
      if (!token) {
        return;
      }

      try {
        // Clear cache to ensure fresh data after update
        languagePrefsCache = null;

        const updatedPrefs = await userService.updateLanguagePreferences({
          preferredLanguage: language,
        });

        // Update cache with new preferences
        languagePrefsCache = updatedPrefs;

        // Apply language change immediately if different
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
