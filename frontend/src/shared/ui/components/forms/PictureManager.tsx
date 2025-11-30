import React, { useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'shared/constants/ApiConstants';
import { APP_CONFIG } from 'shared/constants/AppConstants';

import Button from './Button';
import styles from './PictureManager.module.scss';

/**
 * Props for the PictureManager component.
 */
interface PictureManagerProps {
  imageUrl?: string | null; // URL of the current image
  defaultImage: string; // Fallback image when no image is set
  altText: string; // Accessibility text for the image
  onUpload: (file: File) => void; // Callback when new image is uploaded
  onDelete?: () => void; // Optional callback for deleting current image
  showDeleteButton?: boolean; // Whether to show delete button
  className?: string;
  imageClassName?: string;
  uploadButtonText?: string; // Custom text for upload button
  deleteButtonText?: string; // Custom text for delete button
}

/**
 * Picture management component for uploading and deleting profile images.
 * Provides a complete interface for image management with upload, delete, and preview functionality.
 * Automatically handles image URL construction and file validation.
 * 
 * @param {string | null} imageUrl - URL of the current image relative to API base
 * @param {string} defaultImage - Fallback image URL to display when no image is set
 * @param {string} altText - Accessibility description for the image
 * @param {function} onUpload - Callback function called when a new image file is selected
 * @param {function} onDelete - Optional callback function called when delete button is clicked
 * @param {boolean} showDeleteButton - Whether to display the delete button
 * @param {string} className - Optional CSS class for the container
 * @param {string} imageClassName - Optional CSS class for the image element
 * @param {string} uploadButtonText - Custom text for the upload/change button
 * @param {string} deleteButtonText - Custom text for the delete button
 */
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

  // Construct full image URL or use default
  const imageSource = imageUrl ? `${API_BASE_URL.replace('/api', '')}${imageUrl}` : defaultImage;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  // Programmatically trigger file input dialog
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.imageContainer}>
        <img src={imageSource} alt={altText} className={`${styles.image} ${imageClassName}`} />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept={APP_CONFIG.ALLOWED_IMAGE_TYPES}
      />

      <div className={styles.buttonGroup}>
        <Button type="button" onClick={triggerFileInput} variant="secondary" className={styles.themeButton}>
          {uploadButtonText ?? t('common:pictureManager.changeButton')}
        </Button>

        {showDeleteButton && onDelete && imageUrl && (
          <Button type="button" onClick={onDelete} variant="destructive">
            {deleteButtonText ?? t('common:pictureManager.deleteButton')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PictureManager;
