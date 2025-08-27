import { CHAT_BACKGROUND_OPTIONS } from 'constants';

import React from 'react';

import { useTranslation } from 'react-i18next';

import { usePreferences } from 'hooks/common';
import styles from 'pages/SettingsPage.module.css';

const BoardAppearanceSection: React.FC = () => {
  const { t } = useTranslation();
  const { preferences, updatePreferences } = usePreferences();

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>{t('settingsPage.boardAppearanceHeader')}</h2>
      <div className={styles.field}>
        <label>{t('settingsPage.boardBackgroundColorLabel')}</label>
        <div className={styles.colorSwatchContainer}>
          {CHAT_BACKGROUND_OPTIONS.map((option) => (
            <button
              key={option.color}
              type="button"
              className={`${styles.colorSwatch} ${preferences.boardBackgroundSetting === option.color ? styles.active : ''}`}
              style={{ backgroundColor: option.color }}
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
