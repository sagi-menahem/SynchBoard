import React, { useEffect, useState } from 'react';

import type { LanguagePreferences } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLanguageSync } from 'shared/hooks';
import logger from 'shared/utils/logger';

import styles from '../pages/SettingsPage.module.css';


const LanguageSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { loadUserLanguage, updateLanguagePreference, isLanguageLoaded } = useLanguageSync();
  const [languagePrefs, setLanguagePrefs] = useState<LanguagePreferences>({ preferredLanguage: 'en' });
  const [isLoading, setIsLoading] = useState(true);

  const currentLanguage = languagePrefs.preferredLanguage || i18n.language || 'en';

  useEffect(() => {
    const initializeLanguagePrefs = async () => {
      try {
        const prefs = await loadUserLanguage();
        if (prefs) {
          setLanguagePrefs(prefs);
        }
      } catch (error) {
        logger.error('Failed to load language preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLanguageLoaded) {
      initializeLanguagePrefs();
    } else {
      setLanguagePrefs({ preferredLanguage: i18n.language as 'en' | 'he' });
      setIsLoading(false);
    }
  }, [loadUserLanguage, isLanguageLoaded, i18n.language]);

  const handleLanguageChange = async (language: 'en' | 'he') => {
    try {
      const updatedPrefs = await updateLanguagePreference(language);
      if (updatedPrefs) {
        setLanguagePrefs(updatedPrefs);
      }
      toast.success(t('success.preferences.update'));
    } catch (error) {
      logger.error('Failed to update language preference:', error);
      toast.error(t('errors.common.unexpected'));
      i18n.changeLanguage(currentLanguage);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>{t('settingsPage.languageHeader')}</h2>
        <div className={styles.field}>
          <label>{t('settingsPage.languageLabel')}</label>
          <div className={styles.radioGroup}>
            <span>{t('settingsPage.loading')}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>{t('settingsPage.languageHeader')}</h2>
      <div className={styles.field}>
        <label>{t('settingsPage.languageLabel')}</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="language"
              value="en"
              checked={currentLanguage === 'en'}
              onChange={() => handleLanguageChange('en')}
            />
            {t('settingsPage.language.en')}
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="language"
              value="he"
              checked={currentLanguage === 'he'}
              onChange={() => handleLanguageChange('he')}
            />
            {t('settingsPage.language.he')}
          </label>
        </div>
      </div>
    </section>
  );
};

export default LanguageSection;