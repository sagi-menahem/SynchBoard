import React from 'react';

import { useUserPreferences } from 'features/settings/UserPreferencesProvider';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import styles from './ThemeSwitcher.module.scss';

interface ThemeSwitcherProps {
  className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const { t } = useTranslation(['common']);
  const { preferences, setTheme } = useUserPreferences();

  const currentTheme = preferences.theme;

  const handleThemeChange = (theme: 'light' | 'dark') => {
    void setTheme(theme);
  };

  return (
    <div className={`${styles.themeSwitcher} ${className ?? ''}`}>
      <span className={styles.label}>{t('common:theme')}</span>
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.themeButton} ${currentTheme === 'light' ? styles.active : ''}`}
          onClick={() => handleThemeChange('light')}
          type="button"
          title={t('common:lightTheme')}
        >
          <Sun size={14} />
        </button>
        <button
          className={`${styles.themeButton} ${currentTheme === 'dark' ? styles.active : ''}`}
          onClick={() => handleThemeChange('dark')}
          type="button"
          title={t('common:darkTheme')}
        >
          <Moon size={14} />
        </button>
      </div>
    </div>
  );
};

export default ThemeSwitcher;