import React from 'react';

import { useTranslation } from 'react-i18next';

import Button from 'components/common/Button';
import ProfileDisplayView from 'components/settings/ProfileDisplayView';
import ProfileEditForm from 'components/settings/ProfileEditForm';
import { useProfileEditing } from 'hooks/settings/useProfileEditing';
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
        } catch { }
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionHeader}>
                {t('settingsPage.profileSectionHeader')}
                {!isEditing && (
                    <Button onClick={startEditing} variant="secondary">
                        {t('settingsPage.buttons.edit')}
                    </Button>
                )}
            </h2>

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
