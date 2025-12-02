/**
 * Internationalization (i18n) configuration for the SynchBoard application.
 * Configures i18next with English and Hebrew language support, including RTL layout handling.
 * Provides utilities for language detection, direction management, and document attribute updates.
 */

import i18n from 'i18next';
import enAuth from 'locales/en/auth.json';
import enBoard from 'locales/en/board.json';
import enChat from 'locales/en/chat.json';
import enCommon from 'locales/en/common.json';
import enSettings from 'locales/en/settings.json';
import heAuth from 'locales/he/auth.json';
import heBoard from 'locales/he/board.json';
import heChat from 'locales/he/chat.json';
import heCommon from 'locales/he/common.json';
import heSettings from 'locales/he/settings.json';
import { initReactI18next } from 'react-i18next';

// Translation resources organized by language and namespace
const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    board: enBoard,
    chat: enChat,
    settings: enSettings,
  },
  he: {
    common: heCommon,
    auth: heAuth,
    board: heBoard,
    chat: heChat,
    settings: heSettings,
  },
};

/**
 * Determines the initial language for the application on startup.
 * Checks guest language preference first, then stored i18next language,
 * falling back to English if neither is available or valid.
 *
 * @returns {string} The initial language code ('en' or 'he')
 */
const getInitialLanguage = (): string => {
  // Check guest language preference (for unauthenticated users)
  const guestLanguage = localStorage.getItem('guest-language');
  if (guestLanguage && ['en', 'he'].includes(guestLanguage)) {
    return guestLanguage;
  }

  // Check stored i18next language preference
  const storedLanguage = localStorage.getItem('i18nextLng');
  if (storedLanguage && ['en', 'he'].includes(storedLanguage)) {
    return storedLanguage;
  }

  // Default to English
  return 'en';
};

// Initialize i18n with React integration
void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',

  defaultNS: 'common',
  ns: ['common', 'auth', 'board', 'chat', 'settings'],

  interpolation: {
    escapeValue: false, // React already escapes by default
  },

  react: {
    useSuspense: false, // Disable suspense to prevent loading issues
  },

  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
});

export const RTL_LANGUAGES = ['he', 'ar'];

/**
 * Determines if a language requires right-to-left (RTL) text direction.
 *
 * @param {string} language - The language code to check
 * @returns {boolean} True if the language requires RTL layout
 */
export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language);
};

/**
 * Gets the text direction for a given language.
 *
 * @param {string} language - The language code to check
 * @returns {'ltr' | 'rtl'} The appropriate text direction
 */
export const getTextDirection = (language: string): 'ltr' | 'rtl' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

/**
 * Updates the document's direction and language attributes based on the current language.
 * This affects the entire application's layout direction and accessibility attributes.
 *
 * @param {string} language - The language code to apply to the document
 */
export const updateDocumentDirection = (language: string): void => {
  const direction = getTextDirection(language);
  document.documentElement.dir = direction;
  document.documentElement.lang = language;
};

export default i18n;
