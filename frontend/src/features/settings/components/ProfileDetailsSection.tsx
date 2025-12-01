import { ProfileDisplayView, ProfileEditForm } from 'features/settings/components';
import { useUserProfile } from 'features/settings/hooks/profile/useUserProfile';
import type { UpdateUserProfileRequest, UserProfile } from 'features/settings/types/UserTypes';
import { PencilLine } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SectionCard } from 'shared/ui';
import logger from 'shared/utils/logger';

import styles from '../pages/SettingsPage.module.scss';

/**
 * Properties for the ProfileDetailsSection component defining user data and update handlers.
 */
interface ProfileDetailsSectionProps {
  /** User profile data to display and edit */
  user: UserProfile;
  /** Async function to handle profile update submission with validation */
  onUpdateProfile: (data: UpdateUserProfileRequest) => Promise<void>;
}

/**
 * Profile details management section with inline editing capabilities.
 * Provides a toggle between display and edit modes for user profile information.
 * Integrates form state management with validation and error handling for profile updates.
 * Implements contextual edit controls with save/cancel operations and proper form isolation.
 * 
 * @param user - User profile data containing current information to display
 * @param onUpdateProfile - Async function to handle validated profile update requests
 */
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
          <Button onClick={startEditing} variant="secondary-glass" className={`${styles.editButton} ${styles.themeButton}`}>
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
