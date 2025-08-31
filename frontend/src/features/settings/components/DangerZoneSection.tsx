import React from 'react';

import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, SectionCard } from 'shared/ui';

interface DangerZoneSectionProps {
    onDeleteAccount: () => void;
}

const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({ onDeleteAccount }) => {
  const { t } = useTranslation(['settings', 'common']);

  return (
    <SectionCard 
      title={t('settings:page.dangerZoneHeader')}
      subtitle={t('settings:page.dangerZoneText')}
      variant="danger"
    >
      <Button onClick={onDeleteAccount} variant="destructive">
        <Trash2 size={16} />
        {t('settings:page.deleteAccountButton')}
      </Button>
    </SectionCard>
  );
};

export default DangerZoneSection;
