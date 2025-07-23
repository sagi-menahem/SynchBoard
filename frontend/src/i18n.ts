// File: frontend/src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from 'locales/en/translation.json';
import heTranslations from 'locales/he/translation.json';

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
    lng: "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;