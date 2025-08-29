import React from 'react';

import { useTranslation } from 'react-i18next';
import ThemeSwitcher from 'shared/ui/components/forms/ThemeSwitcher';

import styles from '../pages/SettingsPage.module.scss';

const ThemeSection: React.FC = () => {
  const { t } = useTranslation(['settings']);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>{t('settings:page.themeHeader')}</h2>
      <div className={styles.field}>
        <ThemeSwitcher />
      </div>
    </section>
  );
};

export default ThemeSection;