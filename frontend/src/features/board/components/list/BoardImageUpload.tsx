import defaultBoardImage from 'assets/default-board-image.png';
import React, { useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import Button from 'shared/ui/components/forms/Button';

import styles from './BoardImageUpload.module.scss';

/**
 * Props interface for BoardImageUpload component.
 * Defines the image selection callback and component state configuration.
 */
interface BoardImageUploadProps {
  /** Callback function triggered when user selects or removes an image file */
  onImageSelect: (file: File | null) => void;
  /** Whether the upload functionality should be disabled */
  disabled?: boolean;
}

/**
 * Interactive image upload component with preview functionality for board creation.
 * This component provides a user-friendly interface for selecting board images with 
 * drag-and-drop style interactions, preview display, and removal capabilities.
 * 
 * @param onImageSelect - Callback function triggered when user selects or removes an image file
 * @param disabled - Whether the upload functionality should be disabled
 */
const BoardImageUpload: React.FC<BoardImageUploadProps> = ({ onImageSelect, disabled = false }) => {
  const { t } = useTranslation(['board', 'common']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultBoardImage);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(defaultBoardImage);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleImageClick();
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.imageContainer}
        onClick={handleImageClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={
          disabled ? t('board:createForm.boardImageAlt') : t('board:createForm.clickToUpload')
        }
      >
        <img
          src={previewUrl}
          alt={t('board:createForm.boardImageAlt')}
          className={styles.previewImage}
        />
        {!disabled && (
          <div className={styles.overlay}>
            <span className={styles.overlayText}>{t('board:createForm.clickToUpload')}</span>
          </div>
        )}
      </div>

      <input
        id="board-image-upload"
        name="boardImage"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
        disabled={disabled}
      />

      {previewUrl !== defaultBoardImage && !disabled && (
        <Button
          type="button"
          onClick={handleRemoveImage}
          variant="destructive"
          className={styles.removeButton}
        >
          {t('board:createForm.removeImage')}
        </Button>
      )}
    </div>
  );
};

export default BoardImageUpload;
