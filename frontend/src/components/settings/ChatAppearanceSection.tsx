import { CHAT_BACKGROUND_OPTIONS } from 'constants';

import React from 'react';

import { useTranslation } from 'react-i18next';

import { usePreferences } from 'hooks/common';
import styles from 'pages/SettingsPage.module.css';

const ChatAppearanceSection: React.FC = () => {
    const { t } = useTranslation();
    const { preferences, updatePreferences } = usePreferences();

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionHeader}>{t('settingsPage.chatAppearanceHeader')}</h2>
            <div className={styles.field}>
                <label>{t('settingsPage.chatBackgroundColorLabel')}</label>
                <div className={styles.colorSwatchContainer}>
                    {CHAT_BACKGROUND_OPTIONS.map((option) => (
                        <button
                            key={option.color}
                            type="button"
                            className={`${styles.colorSwatch} ${preferences.chatBackgroundSetting === option.color ? styles.active : ''}`}
                            style={{ backgroundColor: option.color }}
                            onClick={() => updatePreferences({ ...preferences, chatBackgroundSetting: option.color })}
                            title={option.name}
                            aria-label={option.name}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ChatAppearanceSection;
