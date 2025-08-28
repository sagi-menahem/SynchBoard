import React, { useEffect, useState } from 'react';

import { useLanguageSync } from 'features/settings/hooks';
import type { LanguagePreferences } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';

import styles from '../pages/SettingsPage.module.css';


const LanguageSection: React.FC = () => {
  const { t, i18n } = useTranslation(['settings', 'common']);
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
      toast.success(t('common:success.preferences.update'));
    } catch (error) {
      logger.error('Failed to update language preference:', error);
      toast.error(t('common:errors.common.unexpected'));
      i18n.changeLanguage(currentLanguage);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>{t('settings:page.languageHeader')}</h2>
        <div className={styles.field}>
          <label>{t('settings:page.languageLabel')}</label>
          <div className={styles.radioGroup}>
            <span>{t('settings:page.loading')}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>{t('settings:page.languageHeader')}</h2>
      <div className={styles.field}>
        <label>{t('settings:page.languageLabel')}</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="language"
              value="en"
              checked={currentLanguage === 'en'}
              onChange={() => handleLanguageChange('en')}
            />
            {t('settings:page.language.en')}
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="language"
              value="he"
              checked={currentLanguage === 'he'}
              onChange={() => handleLanguageChange('he')}
            />
            {t('settings:page.language.he')}
          </label>
        </div>
      </div>
    </section>
  );
};

export default LanguageSection;