import React from 'react';

import { useTranslation } from 'react-i18next';

import Button from 'components/common/Button';
import styles from 'pages/SettingsPage.module.css';

interface DangerZoneSectionProps {
    onDeleteAccount: () => void;
}

const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({ onDeleteAccount }) => {
    const { t } = useTranslation();

    return (
        <section className={`${styles.section} ${styles.dangerZone}`}>
            <h2 className={styles.sectionHeader}>{t('settingsPage.dangerZoneHeader')}</h2>
            <p>{t('settingsPage.dangerZoneText')}</p>
            <Button onClick={onDeleteAccount} className={styles.destructiveButton}>
                {t('settingsPage.deleteAccountButton')}
            </Button>
        </section>
    );
};

export default DangerZoneSection;
