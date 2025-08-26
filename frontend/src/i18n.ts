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

// Initialize with guest language from localStorage or default to 'en'
const getInitialLanguage = (): string => {
  // Check for guest language preference first
  const guestLanguage = localStorage.getItem('guest-language');
  if (guestLanguage && ['en', 'he'].includes(guestLanguage)) {
    return guestLanguage;
  }
  
  // Fall back to i18next stored language
  const storedLanguage = localStorage.getItem('i18nextLng');
  if (storedLanguage && ['en', 'he'].includes(storedLanguage)) {
    return storedLanguage;
  }
  
  // Default to English
  return 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },

  // RTL Support Configuration
  react: {
    useSuspense: false,
  },

  // Language detection options
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
});

// RTL Language Support
export const RTL_LANGUAGES = ['he', 'ar'];

// Utility function to check if a language is RTL
export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language);
};

// Utility function to get text direction for a language
export const getTextDirection = (language: string): 'ltr' | 'rtl' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

// Function to update document direction
export const updateDocumentDirection = (language: string): void => {
  const direction = getTextDirection(language);
  document.documentElement.dir = direction;
  document.documentElement.lang = language;
};

export default i18n;
