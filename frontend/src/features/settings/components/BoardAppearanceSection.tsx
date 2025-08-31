import React from 'react';

import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import { useTranslation } from 'react-i18next';
import { CHAT_BACKGROUND_OPTIONS } from 'shared/constants';
import Button from 'shared/ui/components/forms/Button';

import styles from '../pages/SettingsPage.module.scss';

const BoardAppearanceSection: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { preferences, updatePreferences } = useUserBoardPreferences();

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>{t('settings:page.boardAppearanceHeader')}</h2>
      <div className={styles.field}>
        <label>{t('settings:page.boardBackgroundColorLabel')}</label>
        <ul className={styles.colorSwatchContainer}>
          {CHAT_BACKGROUND_OPTIONS.map((option) => (
            <li key={option.color}>
              <Button
                type="button"
                variant="icon"
                className={`${styles.colorSwatch} ${preferences.boardBackgroundSetting === option.color ? styles.active : ''}`}
                style={{ backgroundColor: `var(${option.cssVar})` }}
                onClick={() => updatePreferences({ boardBackgroundSetting: option.color })}
                title={t(option.nameKey)}
                aria-label={t(option.nameKey)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default BoardAppearanceSection;
