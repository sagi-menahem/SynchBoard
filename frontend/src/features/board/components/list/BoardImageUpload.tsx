import defaultBoardImage from 'assets/default-board-image.png';
import React, { useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import Button from 'shared/ui/components/forms/Button';

import styles from './BoardImageUpload.module.scss';

interface BoardImageUploadProps {
  onImageSelect: (file: File | null) => void;
  disabled?: boolean;
}

const BoardImageUpload: React.FC<BoardImageUploadProps> = ({ onImageSelect, disabled = false }) => {
  const { t } = useTranslation(['board', 'common']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultBoardImage);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
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
