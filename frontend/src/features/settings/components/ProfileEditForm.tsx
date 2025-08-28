import React from 'react';

import type { UpdateUserProfileRequest } from 'features/settings/types/UserTypes';
import { Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'shared/ui';

import styles from '../pages/SettingsPage.module.css';

interface ProfileEditFormProps {
    formData: UpdateUserProfileRequest;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ formData, onInputChange, onSave, onCancel }) => {
    const { t } = useTranslation(['settings', 'common']);

    return (
        <>
            <div className={styles.field}>
                <label htmlFor="firstName">
                    {t('settings:page.firstNameLabel')}
                    <span className={styles.required}> *</span>
                </label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={onInputChange} required />
            </div>
            <div className={styles.field}>
                <label htmlFor="lastName">{t('settings:page.lastNameLabel')}</label>
                <Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={onInputChange} />
            </div>
            <div className={styles.field}>
                <label htmlFor="gender">
                    {t('settings:page.genderLabel')}
                    <span className={styles.required}> *</span>
                </label>
                <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={formData.gender === 'male'}
                            onChange={onInputChange}
                            required
                        />
                        {t('common:form.option.male')}
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={formData.gender === 'female'}
                            onChange={onInputChange}
                            required
                        />
                        {t('common:form.option.female')}
                    </label>
                </div>
            </div>
            <div className={styles.field}>
                <label htmlFor="dateOfBirth">{t('settings:page.dateOfBirthLabel')}</label>
                <Input 
                    id="dateOfBirth" 
                    name="dateOfBirth" 
                    type="date" 
                    value={formData.dateOfBirth || ''} 
                    onChange={onInputChange}
                    className={styles.dateInput}
                />
            </div>
            <div className={styles.field}>
                <label htmlFor="phoneNumber">{t('settings:page.phoneNumberLabel')}</label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ''} onChange={onInputChange} />
            </div>
            <div className={styles.buttonGroup}>
                <Button onClick={onCancel} variant="secondary">
                    <X size={16} />
                    {t('settings:page.buttons.cancel')}
                </Button>
                <Button onClick={onSave} variant="primary">
                    <Save size={16} />
                    {t('settings:page.buttons.save')}
                </Button>
            </div>
        </>
    );
};

export default ProfileEditForm;
