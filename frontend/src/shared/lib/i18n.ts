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

const getInitialLanguage = (): string => {
  const guestLanguage = localStorage.getItem('guest-language');
  if (guestLanguage && ['en', 'he'].includes(guestLanguage)) {
    return guestLanguage;
  }

  const storedLanguage = localStorage.getItem('i18nextLng');
  if (storedLanguage && ['en', 'he'].includes(storedLanguage)) {
    return storedLanguage;
  }

  return 'en';
};

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',

  // Configure namespaces
  defaultNS: 'common',
  ns: ['common', 'auth', 'board', 'chat', 'settings'],

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },

  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
});

export const RTL_LANGUAGES = ['he', 'ar'];

export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language);
};

export const getTextDirection = (language: string): 'ltr' | 'rtl' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

export const updateDocumentDirection = (language: string): void => {
  const direction = getTextDirection(language);
  document.documentElement.dir = direction;
  document.documentElement.lang = language;
};

export default i18n;
