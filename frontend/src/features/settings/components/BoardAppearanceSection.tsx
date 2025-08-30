import React from 'react';

import { usePreferences } from 'features/settings/UserBoardPreferencesProvider';
import { useTranslation } from 'react-i18next';
import { CHAT_BACKGROUND_OPTIONS } from 'shared/constants';
import Button from 'shared/ui/components/forms/Button';

import styles from '../pages/SettingsPage.module.scss';

const BoardAppearanceSection: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { preferences, updatePreferences } = usePreferences();

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>{t('settings:page.boardAppearanceHeader')}</h2>
      <div className={styles.field}>
        <label>{t('settings:page.boardBackgroundColorLabel')}</label>
        <div className={styles.colorSwatchContainer}>
          {CHAT_BACKGROUND_OPTIONS.map((option) => (
            <Button
              key={option.color}
              type="button"
              variant="icon"
              className={`${styles.colorSwatch} ${preferences.boardBackgroundSetting === option.color ? styles.active : ''}`}
              style={{ backgroundColor: `var(${option.cssVar})` }}
              onClick={() => updatePreferences({ ...preferences, boardBackgroundSetting: option.color })}
              title={t(option.nameKey)}
              aria-label={t(option.nameKey)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoardAppearanceSection;
