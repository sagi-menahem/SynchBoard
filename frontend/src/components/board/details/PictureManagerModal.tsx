import React, { useRef } from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import { useTranslation } from 'react-i18next';

import Button from 'components/common/Button';
import Modal from 'components/common/Modal';
import { API_BASE_URL } from 'constants/ApiConstants';
import { APP_CONFIG } from 'constants/AppConstants';

import styles from './PictureManagerModal.module.css';

interface PictureManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardName: string;
    pictureUrl: string | null;
    onPictureUpload: (file: File) => void;
    onPictureDelete: () => void;
}

const PictureManagerModal: React.FC<PictureManagerModalProps> = ({
  isOpen,
  onClose,
  boardName,
  pictureUrl,
  onPictureUpload,
  onPictureDelete,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onPictureUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const imageSource = pictureUrl ? `${API_BASE_URL.replace('/api', '')}${pictureUrl}` : defaultBoardImage;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3>{t('pictureManager.title', { boardName })}</h3>
        <img src={imageSource} alt={boardName} className={styles.previewImage} />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept={APP_CONFIG.ALLOWED_IMAGE_TYPES}
        />
        <div className={styles.buttonGroup}>
          <Button onClick={triggerFileInput} variant="primary">
            {t('pictureManager.changeButton')}
          </Button>
          <Button onClick={onPictureDelete} disabled={!pictureUrl} className={styles.destructiveButton}>
            {t('pictureManager.deleteButton')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PictureManagerModal;
