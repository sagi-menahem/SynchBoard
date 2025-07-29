// File: frontend/src/components/settings/ProfileDisplayView.tsx
import styles from 'pages/SettingsPage.module.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserProfile } from 'types/user.types';

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
                <p>{user.lastName}</p>
            </div>
            <div className={styles.field}>
                <label>{t('settingsPage.phoneNumberLabel')}</label>
                <p>{user.phoneNumber}</p>
            </div>
        </>
    );
};

export default ProfileDisplayView;
