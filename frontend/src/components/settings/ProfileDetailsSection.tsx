import React from 'react';

import { PencilLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import { Button } from 'components/common';
import { ProfileDisplayView, ProfileEditForm } from 'components/settings';
import { useProfileEditing } from 'hooks/settings/profile';
import styles from 'pages/SettingsPage.module.css';
import type { UpdateUserProfileRequest, UserProfile } from 'types/UserTypes';

interface ProfileDetailsSectionProps {
    user: UserProfile;
    onUpdateProfile: (data: UpdateUserProfileRequest) => Promise<void>;
}

const ProfileDetailsSection: React.FC<ProfileDetailsSectionProps> = ({ user, onUpdateProfile }) => {
  const { t } = useTranslation();
  const { isEditing, formData, onInputChange, startEditing, cancelEditing, stopEditing } = useProfileEditing(user);

  const onSave = async () => {
    try {
      await onUpdateProfile(formData);
      stopEditing();
    } catch (error) {
      logger.error('[ProfileDetailsSection] Failed to update profile:', error);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {t('settingsPage.profileSectionHeader')}
        </h2>
        {!isEditing && (
          <Button onClick={startEditing} variant="secondary" className={styles.editButton}>
            <PencilLine size={16} />
            {t('settingsPage.buttons.edit')}
          </Button>
        )}
      </div>

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
    </section>
  );
};

export default ProfileDetailsSection;
