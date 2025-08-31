import React from 'react';

import { useTranslation } from 'react-i18next';
import { SectionCard } from 'shared/ui';
import ThemeSwitcher from 'shared/ui/components/forms/ThemeSwitcher';

import styles from '../pages/SettingsPage.module.scss';

const ThemeSection: React.FC = () => {
  const { t } = useTranslation(['settings']);

  return (
    <SectionCard 
      title={t('settings:page.themeHeader')}
      variant="default"
    >
      <div className={styles.field}>
        <ThemeSwitcher />
      </div>
    </SectionCard>
  );
};

export default ThemeSection;