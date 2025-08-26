import React from 'react';

import { X, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Button from 'components/common/Button';
import Input from 'components/common/Input';
import styles from 'pages/SettingsPage.module.css';
import type { UpdateUserProfileRequest } from 'types/UserTypes';

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
                <label htmlFor="firstName">
                    {t('settingsPage.firstNameLabel')}
                    <span className={styles.required}> *</span>
                </label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={onInputChange} required />
            </div>
            <div className={styles.field}>
                <label htmlFor="lastName">{t('settingsPage.lastNameLabel')}</label>
                <Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={onInputChange} />
            </div>
            <div className={styles.field}>
                <label htmlFor="gender">
                    {t('settingsPage.genderLabel')}
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
                        {t('common.form.option.male')}
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
                        {t('common.form.option.female')}
                    </label>
                </div>
            </div>
            <div className={styles.field}>
                <label htmlFor="dateOfBirth">{t('settingsPage.dateOfBirthLabel')}</label>
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
                <label htmlFor="phoneNumber">{t('settingsPage.phoneNumberLabel')}</label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ''} onChange={onInputChange} />
            </div>
            <div className={styles.buttonGroup}>
                <Button onClick={onCancel} variant="secondary">
                    <X size={16} />
                    {t('settingsPage.buttons.cancel')}
                </Button>
                <Button onClick={onSave} variant="primary">
                    <Save size={16} />
                    {t('settingsPage.buttons.save')}
                </Button>
            </div>
        </>
    );
};

export default ProfileEditForm;
