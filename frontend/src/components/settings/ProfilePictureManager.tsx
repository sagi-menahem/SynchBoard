import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { useTranslation } from 'react-i18next';

import { PictureManager } from 'components/common';
import type { UserProfile } from 'types/UserTypes';

interface ProfilePictureManagerProps {
    user: UserProfile;
    onUpload: (file: File) => void;
    onDelete: () => void;
}

const ProfilePictureManager: React.FC<ProfilePictureManagerProps> = ({ user, onUpload, onDelete }) => {
  const { t } = useTranslation();

  return (
    <PictureManager
      imageUrl={user.profilePictureUrl}
      defaultImage={defaultUserImage}
      altText={t('settingsPage.profilePictureAlt', { userName: user.firstName })}
      onUpload={onUpload}
      onDelete={onDelete}
      showDeleteButton={!!user.profilePictureUrl}
      imageClassName="profile"
    />
  );
};

export default ProfilePictureManager;