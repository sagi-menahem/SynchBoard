import React from 'react';

import { useTranslation } from 'react-i18next';

import styles from 'pages/SettingsPage.module.css';
import type { UserProfile } from 'types/UserTypes';

interface ProfileDisplayViewProps {
    user: UserProfile;
}

const ProfileDisplayView: React.FC<ProfileDisplayViewProps> = ({ user }) => {
    const { t } = useTranslation();

    return (
        <>
            <div className={styles.field}>
                <label>{t('settingsPage.firstNameLabel')}</label>
                <p>{user.firstName}</p>
            </div>
            <div className={styles.field}>
                <label>{t('settingsPage.lastNameLabel')}</label>
                <p>{user.lastName || t('settingsPage.notProvided')}</p>
            </div>
            <div className={styles.field}>
                <label>{t('settingsPage.genderLabel')}</label>
                <p>{user.gender ? t(`common.form.option.${user.gender}`) : t('settingsPage.notProvided')}</p>
            </div>
            <div className={styles.field}>
                <label>{t('settingsPage.dateOfBirthLabel')}</label>
                <p>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : t('settingsPage.notProvided')}</p>
            </div>
            <div className={styles.field}>
                <label>{t('settingsPage.phoneNumberLabel')}</label>
                <p>{user.phoneNumber || t('settingsPage.notProvided')}</p>
            </div>
        </>
    );
};

export default ProfileDisplayView;
