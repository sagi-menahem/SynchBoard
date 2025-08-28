
import React, { useRef } from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import type { UserProfile } from 'features/settings/types/UserTypes';
import { Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL, APP_CONFIG } from 'shared/constants';
import { Button } from 'shared/ui';

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className={styles.imageContainer}>
        <img
          src={imageSource}
          alt={t('settingsPage.profilePictureAlt', { userName: user.firstName })}
          className={styles.profileImage}
        />
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept={APP_CONFIG.ALLOWED_IMAGE_TYPES}
      />
      
      <div className={styles.buttonGroup}>
        <Button 
          onClick={triggerFileInput}
          variant="secondary"
        >
          <Upload size={16} />
          {t('settingsPage.changePicture')}
        </Button>
        <Button 
          onClick={onDelete}
          variant="destructive"
        >
          <Trash2 size={16} />
          {t('settingsPage.deletePicture')}
        </Button>
      </div>
    </>
  );
};

export default ProfilePictureManager;