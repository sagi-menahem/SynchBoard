import React from 'react';

import type { UserProfile } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';

import styles from '../pages/SettingsPage.module.scss';

interface ProfileDisplayViewProps {
  user: UserProfile;
}

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
