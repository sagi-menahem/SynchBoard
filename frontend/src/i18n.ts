import i18n from 'i18next';
import enTranslations from 'locales/en/translation.json';
import heTranslations from 'locales/he/translation.json';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: enTranslations,
  },
  he: {
    translation: heTranslations,
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

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',

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
