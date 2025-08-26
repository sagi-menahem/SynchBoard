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
});

export default i18n;
