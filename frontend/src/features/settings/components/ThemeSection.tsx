import React from 'react';

import { useTranslation } from 'react-i18next';
import { SectionCard } from 'shared/ui';
import ThemeSwitcher from 'shared/ui/components/forms/ThemeSwitcher';

import styles from '../pages/SettingsPage.module.scss';

/**
 * Theme selection section component for user interface customization.
 * Provides a simple interface for switching between application themes (light/dark/system).
 * Integrates with the global theme system to provide immediate visual feedback and persistence.
 * Uses the shared ThemeSwitcher component with appropriate sizing and labeling for settings context.
 */
const ThemeSection: React.FC = () => {
  const { t } = useTranslation(['settings']);

  return (
    <SectionCard title={t('settings:page.themeHeader')} variant="default">
      <div className={styles.field}>
        <ThemeSwitcher showLabel size="md" />
      </div>
    </SectionCard>
  );
};

export default ThemeSection;
