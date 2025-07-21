// File: frontend/src/components/settings/ProfilePictureManager.tsx
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ProfilePictureManager.module.css';
import { API_BASE_URL } from '../../constants/api.constants';
import defaultUserImage from '../../assets/default-user-image.png';
import Button from '../common/Button';
import type { UserProfile } from '../../types/user.types';

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
            <img src={imageSource} alt="Profile" className={styles.avatar} />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg, image/gif"
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