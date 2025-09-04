import type { UserProfile } from 'features/settings/types/UserTypes';
import React from 'react';

import { useTranslation } from 'react-i18next';

import styles from '../pages/SettingsPage.module.scss';

/**
 * Properties for the ProfileDisplayView component defining user data to display.
 */
interface ProfileDisplayViewProps {
  /** User profile data containing personal information to render */
  user: UserProfile;
}

/**
 * Read-only profile display component for user information presentation.
 * Renders user profile data in a structured format with proper null handling and localization.
 * Provides formatted display for dates and uses appropriate fallback messages for missing data.
 * Implements accessible field labeling and consistent visual hierarchy for profile information.
 * 
 * @param user - User profile data object containing personal information fields
 */
const ProfileDisplayView: React.FC<ProfileDisplayViewProps> = ({ user }) => {
  const { t } = useTranslation(['settings', 'common']);

  return (
    <>
      <div className={styles.field}>
        <label>{t('settings:page.firstNameLabel')}</label>
        <p>{user.firstName}</p>
      </div>
      <div className={styles.field}>
        <label>{t('settings:page.lastNameLabel')}</label>
        <p>{user.lastName ?? t('settings:page.notProvided')}</p>
      </div>
      <div className={styles.field}>
        <label>{t('settings:page.genderLabel')}</label>
        <p>
          {user.gender ? t(`common:form.option.${user.gender}`) : t('settings:page.notProvided')}
        </p>
      </div>
      <div className={styles.field}>
        <label>{t('settings:page.dateOfBirthLabel')}</label>
        <p>
          {user.dateOfBirth
            ? new Date(user.dateOfBirth).toLocaleDateString()
            : t('settings:page.notProvided')}
        </p>
      </div>
      <div className={styles.field}>
        <label>{t('settings:page.phoneNumberLabel')}</label>
        <p>{user.phoneNumber ?? t('settings:page.notProvided')}</p>
      </div>
    </>
  );
};

export default ProfileDisplayView;
