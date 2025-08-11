import React from 'react';

import { useTranslation } from 'react-i18next';

import Button from 'components/common/Button';
import { CHAT_BACKGROUND_OPTIONS, CHAT_FONT_SIZE_OPTIONS } from 'constants/StyleConstants';
import { usePreferences } from 'hooks/preferences/usePreferences';
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
            <div className={styles.field}>
                <label>{t('settingsPage.chatFontSizeLabel')}</label>
                <div className={styles.fontButtonGroup}>
                    {CHAT_FONT_SIZE_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            variant={preferences.fontSizeSetting === option.value ? 'primary' : 'secondary'}
                            onClick={() => updatePreferences({ ...preferences, fontSizeSetting: option.value })}
                        >
                            {t(option.tKey)}
                        </Button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ChatAppearanceSection;
