import React from 'react';

import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared/ui';

import styles from '../pages/SettingsPage.module.css';

interface DangerZoneSectionProps {
    onDeleteAccount: () => void;
}

const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({ onDeleteAccount }) => {
  const { t } = useTranslation(['settings', 'common']);

  return (
    <section className={`${styles.section} ${styles.dangerZone}`}>
      <h2 className={styles.sectionHeader}>{t('settings:page.dangerZoneHeader')}</h2>
      <p>{t('settings:page.dangerZoneText')}</p>
      <Button onClick={onDeleteAccount} variant="destructive">
        <Trash2 size={16} />
        {t('settings:page.deleteAccountButton')}
      </Button>
    </section>
  );
};

export default DangerZoneSection;
