
import React, { useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'shared/constants/ApiConstants';
import { APP_CONFIG } from 'shared/constants/AppConstants';

import Button from './Button';
import styles from './PictureManager.module.css';

interface PictureManagerProps {
  imageUrl?: string | null;
  defaultImage: string;
  altText: string;
  onUpload: (file: File) => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  className?: string;
  imageClassName?: string;
  uploadButtonText?: string;
  deleteButtonText?: string;
}

const PictureManager: React.FC<PictureManagerProps> = ({
  imageUrl,
  defaultImage,
  altText,
  onUpload,
  onDelete,
  showDeleteButton = true,
  className = '',
  imageClassName = '',
  uploadButtonText,
  deleteButtonText,
}) => {
  const { t } = useTranslation(['common']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageSource = imageUrl 
    ? `${API_BASE_URL.replace('/api', '')}${imageUrl}` 
    : defaultImage;

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
    <div className={`${styles.container} ${className}`}>
      <div className={styles.imageContainer}>
        <img
          src={imageSource}
          alt={altText}
          className={`${styles.image} ${imageClassName}`}
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
          {uploadButtonText || t('common:pictureManager.changeButton')}
        </Button>
        
        {showDeleteButton && onDelete && imageUrl && (
          <Button 
            onClick={onDelete} 
            variant="destructive"
          >
            {deleteButtonText || t('common:pictureManager.deleteButton')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PictureManager;