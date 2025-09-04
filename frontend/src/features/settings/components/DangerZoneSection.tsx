import { Trash2 } from 'lucide-react';
import React from 'react';

import { useTranslation } from 'react-i18next';
import { Button, SectionCard } from 'shared/ui';

import styles from '../pages/SettingsPage.module.scss';

/**
 * Properties for the DangerZoneSection component defining destructive action handlers.
 */
interface DangerZoneSectionProps {
  /** Function to handle account deletion initiation with confirmation flow */
  onDeleteAccount: () => void;
}

/**
 * Danger zone section component for irreversible account management actions.
 * Provides a clearly separated and visually distinct interface for destructive operations.
 * Uses warning styling and explicit labeling to prevent accidental activation of dangerous actions.
 * Implements proper accessibility patterns with clear button labeling and danger styling.
 * 
 * @param onDeleteAccount - Function to initiate account deletion with user confirmation
 */
const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({ onDeleteAccount }) => {
  const { t } = useTranslation(['settings', 'common']);

  return (
    <SectionCard
      title={t('settings:page.dangerZoneHeader')}
      subtitle={t('settings:page.dangerZoneText')}
      variant="danger"
    >
      <div className={styles.buttonGroup}>
        <Button onClick={onDeleteAccount} variant="destructive">
          <Trash2 size={16} />
          {t('settings:page.deleteAccountButton')}
        </Button>
      </div>
    </SectionCard>
  );
};

export default DangerZoneSection;
