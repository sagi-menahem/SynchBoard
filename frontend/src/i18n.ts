// Located at: frontend/src/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import the translation files
import enTranslations from './locales/en/translation.json';
import heTranslations from './locales/he/translation.json';

// The resources object now holds translations for all supported languages
const resources = {
  en: {
    translation: enTranslations
  },
  he: {
    translation: heTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // The default language will still be English
    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;