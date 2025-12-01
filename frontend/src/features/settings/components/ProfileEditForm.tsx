import type { UpdateUserProfileRequest } from 'features/settings/types/UserTypes';
import { Save, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, RadioGroup } from 'shared/ui';

import styles from '../pages/SettingsPage.module.scss';

/**
 * Properties for the ProfileEditForm component defining form data and event handlers.
 */
interface ProfileEditFormProps {
  /** Current form data state for profile update fields */
  formData: UpdateUserProfileRequest;
  /** Handler for input field change events with proper form binding */
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handler for form save operation with validation */
  onSave: () => void;
  /** Handler for form cancellation and state reset */
  onCancel: () => void;
}

/**
 * Profile editing form component with comprehensive field validation and user input handling.
 * Provides editable form fields for all user profile information with proper accessibility support.
 * Implements radio group controls for gender selection and date input handling for birth dates.
 * Includes form validation indicators, required field marking, and intuitive save/cancel operations.
 * 
 * @param formData - Current form state data for profile update fields
 * @param onInputChange - Handler for processing input field change events
 * @param onSave - Handler for save operation with form validation
 * @param onCancel - Handler for cancel operation and form state reset
 */
const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  formData,
  onInputChange,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation(['settings', 'common']);
  const [gender, setGender] = useState<string>(formData.gender || '');

  // Handle gender change with both RadioGroup and form data update
  const handleGenderChange = (value: string) => {
    setGender(value);
    // Create synthetic event to match existing onInputChange handler
    const syntheticEvent = {
      target: { name: 'gender', value },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(syntheticEvent);
  };

  return (
    <>
      <div className={styles.field}>
        <label htmlFor="firstName">
          {t('settings:page.firstNameLabel')}
          <span className={styles.required}> *</span>
        </label>
        <Input
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={onInputChange}
          required
          className={styles.settingsInput}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="lastName">{t('settings:page.lastNameLabel')}</label>
        <Input
          id="lastName"
          name="lastName"
          value={formData.lastName !== null ? formData.lastName : ''}
          onChange={onInputChange}
          className={styles.settingsInput}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="profile-gender">
          {t('settings:page.genderLabel')}
          <span className={styles.required}> *</span>
        </label>
        <RadioGroup
          id="profile-gender"
          value={gender}
          onValueChange={handleGenderChange}
          name="gender"
          orientation="horizontal"
          required
          options={[
            { value: 'male', label: t('common:form.option.male') },
            { value: 'female', label: t('common:form.option.female') },
          ]}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="dateOfBirth">{t('settings:page.dateOfBirthLabel')}</label>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth !== null ? formData.dateOfBirth : ''}
          onChange={onInputChange}
          className={styles.dateInput}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="phoneNumber">{t('settings:page.phoneNumberLabel')}</label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber !== null ? formData.phoneNumber : ''}
          onChange={onInputChange}
          className={styles.settingsInput}
        />
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
