
import { ProfileDisplayView, ProfileEditForm } from 'features/settings/components';
import { useUserProfile } from 'features/settings/hooks/profile/useUserProfile';
import type { UpdateUserProfileRequest, UserProfile } from 'features/settings/types/UserTypes';
import { PencilLine } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SectionCard } from 'shared/ui';
import logger from 'shared/utils/logger';

import styles from '../pages/SettingsPage.module.scss';

interface ProfileDetailsSectionProps {
  user: UserProfile;
  onUpdateProfile: (data: UpdateUserProfileRequest) => Promise<void>;
}

const ProfileDetailsSection: React.FC<ProfileDetailsSectionProps> = ({ user, onUpdateProfile }) => {
  const { t } = useTranslation(['settings', 'common']);
  const { isEditing, formData, onInputChange, startEditing, cancelEditing, stopEditing } =
    useUserProfile();

  const onSave = async () => {
    try {
      await onUpdateProfile(formData);
      stopEditing();
    } catch (error) {
      logger.error('[ProfileDetailsSection] Failed to update profile:', error);
    }
  };

  return (
    <SectionCard
      title={t('settings:page.profileSectionHeader')}
      variant="default"
      headerActions={
        !isEditing ? (
          <Button onClick={startEditing} variant="secondary" className={styles.editButton}>
            <PencilLine size={16} />
            {t('settings:page.buttons.edit')}
          </Button>
        ) : undefined
      }
    >
      {!isEditing ? (
        <ProfileDisplayView user={user} />
      ) : (
        <ProfileEditForm
          formData={formData}
          onInputChange={onInputChange}
          onSave={onSave}
          onCancel={cancelEditing}
        />
      )}
    </SectionCard>
  );
};

export default ProfileDetailsSection;
