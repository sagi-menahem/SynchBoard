import { API_BASE_URL, APP_CONFIG } from 'constants';

import React, { useRef } from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { useTranslation } from 'react-i18next';

import { Button } from 'components/common';
import type { UserProfile } from 'types/UserTypes';

import styles from './ProfilePictureManager.module.css';

interface ProfilePictureManagerProps {
    user: UserProfile;
    onUpload: (file: File) => void;
    onDelete: () => void;
}

const ProfilePictureManager: React.FC<ProfilePictureManagerProps> = ({ user, onUpload, onDelete }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const imageSource = user.profilePictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${user.profilePictureUrl}`
        : defaultUserImage;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className={styles.container}>
            <img
                src={imageSource}
                alt={t('settingsPage.profilePictureAlt', { userName: user.firstName })}
                className={styles.avatar}
            />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept={APP_CONFIG.ALLOWED_IMAGE_TYPES}
            />
            <div className={styles.buttonGroup}>
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                    {t('pictureManager.changeButton')}
                </Button>
                <Button onClick={onDelete} disabled={!user.profilePictureUrl} className={styles.destructiveButton}>
                    {t('pictureManager.deleteButton')}
                </Button>
            </div>
        </div>
    );
};

export default ProfilePictureManager;
