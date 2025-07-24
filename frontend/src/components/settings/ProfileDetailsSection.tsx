// File: frontend/src/components/settings/ProfileDetailsSection.tsx
import Button from 'components/common/Button';
import Input from 'components/common/Input';
import styles from 'pages/SettingsPage.module.css';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UpdateUserProfileRequest, UserProfile } from 'types/user.types';

interface ProfileDetailsSectionProps {
    user: UserProfile;
    onUpdateProfile: (data: UpdateUserProfileRequest) => Promise<void>;
}

const ProfileDetailsSection: React.FC<ProfileDetailsSectionProps> = ({ user, onUpdateProfile }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateUserProfileRequest>({
        firstName: '',
        lastName: '',
        phoneNumber: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
            });
        }
    }, [user]);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSave = async () => {
        try {
            await onUpdateProfile(formData);
            setIsEditing(false);
        } catch {
            // TODO
        }
    };

    const onCancel = () => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
            });
        }
        setIsEditing(false);
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionHeader}>
                {t('settingsPage.profileSectionHeader')}
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="secondary">
                        {t('settingsPage.buttons.edit')}
                    </Button>
                )}
            </h2>

            {!isEditing ? (
                <>
                    <div className={styles.field}>
                        <label>{t('settingsPage.firstNameLabel')}</label>
                        <p>{user.firstName}</p>
                    </div>
                    <div className={styles.field}>
                        <label>{t('settingsPage.lastNameLabel')}</label>
                        <p>{user.lastName}</p>
                    </div>
                    <div className={styles.field}>
                        <label>{t('settingsPage.phoneNumberLabel')}</label>
                        <p>{user.phoneNumber}</p>
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.field}>
                        <label htmlFor="firstName">{t('settingsPage.firstNameLabel')}</label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={onInputChange} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="lastName">{t('settingsPage.lastNameLabel')}</label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={onInputChange} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="phoneNumber">{t('settingsPage.phoneNumberLabel')}</label>
                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={onInputChange}
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <Button onClick={onCancel} variant="secondary">
                            {t('settingsPage.buttons.cancel')}
                        </Button>
                        <Button onClick={onSave} variant="primary">
                            {t('settingsPage.buttons.save')}
                        </Button>
                    </div>
                </>
            )}
        </section>
    );
};

export default ProfileDetailsSection;
