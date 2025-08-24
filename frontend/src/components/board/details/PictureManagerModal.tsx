import React from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import { useTranslation } from 'react-i18next';

import { Modal, PictureManager } from 'components/common';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3>{t('pictureManager.title', { boardName })}</h3>
        
        <PictureManager
          imageUrl={pictureUrl}
          defaultImage={defaultBoardImage}
          altText={boardName}
          onUpload={onPictureUpload}
          onDelete={onPictureDelete}
          showDeleteButton={!!pictureUrl}
          imageClassName="board"
        />
      </div>
    </Modal>
  );
};

export default PictureManagerModal;