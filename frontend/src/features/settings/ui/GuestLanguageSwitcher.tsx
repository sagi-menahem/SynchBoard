import React from 'react';

import { useLanguageSync } from 'features/settings/hooks';
import { useTranslation } from 'react-i18next';

import Button from 'shared/ui/components/forms/Button';

import styles from './GuestLanguageSwitcher.module.scss';

interface GuestLanguageSwitcherProps {
  className?: string;
}

const GuestLanguageSwitcher: React.FC<GuestLanguageSwitcherProps> = ({ className }) => {
  const { t, i18n } = useTranslation(['common']);
  const { setGuestLanguage } = useLanguageSync();

  const currentLanguage = i18n.language as 'en' | 'he';

  const handleLanguageChange = (language: 'en' | 'he') => {
    setGuestLanguage(language);
  };

  return (
    <div className={`${styles.languageSwitcher} ${className ?? ''}`}>
      <span className={styles.label}>{t('common:language')}</span>
      <div className={styles.buttonGroup}>
        <Button
          variant="icon"
          className={`${styles.languageButton} ${currentLanguage === 'en' ? styles.active : ''}`}
          onClick={() => handleLanguageChange('en')}
          type="button"
        >
          EN
        </Button>
        <Button
          variant="icon"
          className={`${styles.languageButton} ${currentLanguage === 'he' ? styles.active : ''}`}
          onClick={() => handleLanguageChange('he')}
          type="button"
        >
          עב
        </Button>
      </div>
    </div>
  );
};

export default GuestLanguageSwitcher;