// File: frontend/src/components/settings/ProfileEditForm.tsx
import Button from 'components/common/Button';
import Input from 'components/common/Input';
import styles from 'pages/SettingsPage.module.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UpdateUserProfileRequest } from 'types/user.types';

interface ProfileEditFormProps {
    formData: UpdateUserProfileRequest;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ formData, onInputChange, onSave, onCancel }) => {
    const { t } = useTranslation();

    return (
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
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={onInputChange} />
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
    );
};

export default ProfileEditForm;
