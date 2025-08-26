import React from 'react';

import { useTranslation } from 'react-i18next';

import { useLanguageSync } from 'hooks/common';

import styles from './GuestLanguageSwitcher.module.css';

interface GuestLanguageSwitcherProps {
  className?: string;
}

const GuestLanguageSwitcher: React.FC<GuestLanguageSwitcherProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const { setGuestLanguage } = useLanguageSync();

  const currentLanguage = i18n.language as 'en' | 'he';

  const handleLanguageChange = (language: 'en' | 'he') => {
    setGuestLanguage(language);
  };

  return (
    <div className={`${styles.languageSwitcher} ${className || ''}`}>
      <span className={styles.label}>{t('common.language')}</span>
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.languageButton} ${currentLanguage === 'en' ? styles.active : ''}`}
          onClick={() => handleLanguageChange('en')}
          type="button"
        >
          EN
        </button>
        <button
          className={`${styles.languageButton} ${currentLanguage === 'he' ? styles.active : ''}`}
          onClick={() => handleLanguageChange('he')}
          type="button"
        >
          עב
        </button>
      </div>
    </div>
  );
};

export default GuestLanguageSwitcher;