import React from 'react';

import clsx from 'clsx';
import { useTheme } from 'features/settings/ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Button from './Button';
import styles from './ThemeSwitcher.module.scss';

interface ThemeSwitcherProps {
  className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const { t } = useTranslation(['common']);
  const { theme, setTheme } = useTheme();

  const currentTheme = theme;

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setTheme(theme);
  };

  return (
    <div className={clsx(styles.themeSwitcher, className)}>
      <span className={styles.label}>{t('common:theme')}</span>
      <div className={styles.buttonGroup}>
        <Button
          variant="icon"
          className={clsx(styles.themeButton, currentTheme === 'light' && styles.active)}
          onClick={() => handleThemeChange('light')}
          type="button"
          title={t('common:lightTheme')}
        >
          <Sun size={14} />
        </Button>
        <Button
          variant="icon"
          className={clsx(styles.themeButton, currentTheme === 'dark' && styles.active)}
          onClick={() => handleThemeChange('dark')}
          type="button"
          title={t('common:darkTheme')}
        >
          <Moon size={14} />
        </Button>
      </div>
    </div>
  );
};

export default ThemeSwitcher;