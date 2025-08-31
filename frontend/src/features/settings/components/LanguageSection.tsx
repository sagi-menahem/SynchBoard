import React, { useEffect, useState } from 'react';

import { useLanguageSync } from 'features/settings/hooks';
import type { LanguagePreferences } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LanguageToggle, SectionCard } from 'shared/ui';
import logger from 'shared/utils/logger';

import styles from '../pages/SettingsPage.module.scss';


const LanguageSection: React.FC = () => {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { loadUserLanguage, updateLanguagePreference, isLanguageLoaded } = useLanguageSync();
  const [languagePrefs, setLanguagePrefs] = useState<LanguagePreferences>({ preferredLanguage: 'en' });
  const [isLoading, setIsLoading] = useState(true);

  const currentLanguage = languagePrefs.preferredLanguage ?? i18n.language ?? 'en';


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
      void initializeLanguagePrefs();
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
      toast.success(t('settings:success.preferences.update'));
    } catch (error) {
      logger.error('Failed to update language preference:', error);
      toast.error(t('common:errors.common.unexpected'));
      void i18n.changeLanguage(currentLanguage);
    }
  };

  if (isLoading) {
    return (
      <SectionCard 
        title={t('settings:page.languageHeader')}
        variant="default"
      >
        <div className={styles.field}>
          <span>{t('settings:page.loading')}</span>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard 
      title={t('settings:page.languageHeader')}
      variant="default"
    >
      <div className={styles.field}>
        <LanguageToggle
          value={currentLanguage}
          onChange={handleLanguageChange}
          size="md"
          showLabel
        />
      </div>
    </SectionCard>
  );
};

export default LanguageSection;