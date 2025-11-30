import defaultBoardImage from 'assets/default-board-image.png';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import { PencilLine, Save, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, PictureManager, SectionCard, Textarea } from 'shared/ui';

import styles from './BoardDetailsHeader.module.scss';

/**
 * Props interface for BoardDetailsHeader component.
 * Defines the board data and event handlers for managing board header content.
 */
interface BoardDetailsHeaderProps {
  /** Complete board information including name, description, and picture */
  boardDetails: BoardDetails;
  /** Whether the current user has admin privileges for this board */
  currentUserIsAdmin: boolean;
  /** Handler for uploading new board picture files */
  onPictureUpload: (file: File) => void;
  /** Handler for updating board description with async validation */
  onUpdateDescription: (description: string) => Promise<void>;
  /** Handler for removing the current board picture */
  onDeletePicture: () => void;
  /** Handler for editing board name */
  onEditName: () => void;
}

/**
 * Renders the board header with picture management and editable description.
 * This component provides a comprehensive interface for managing board visual identity
 * including picture uploads/deletion and inline description editing with admin controls.
 * 
 * @param boardDetails - Complete board information including name, description, and picture
 * @param currentUserIsAdmin - Whether the current user has admin privileges for this board
 * @param onPictureUpload - Handler for uploading new board picture files
 * @param onUpdateDescription - Handler for updating board description with async validation
 * @param onDeletePicture - Handler for removing the current board picture
 */
const BoardDetailsHeader: React.FC<BoardDetailsHeaderProps> = (props) => {
  const { t } = useTranslation(['board', 'common']);
  const {
    boardDetails,
    currentUserIsAdmin,
    onPictureUpload,
    onUpdateDescription,
    onDeletePicture,
    onEditName,
  } = props;

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(boardDetails.description ?? '');

  const handleCancelDescriptionEdit = () => {
    setDescriptionValue(boardDetails.description ?? '');
    setIsEditingDescription(false);
  };

  const handleSaveDescription = async () => {
    setIsUpdating(true);
    try {
      await onUpdateDescription(descriptionValue);
      setIsEditingDescription(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <SectionCard 
        title={t('board:detailsPage.changePicture')} 
        variant="default"
        headerActions={
          currentUserIsAdmin ? (
            <Button
              onClick={onEditName}
              variant="secondary"
              className={styles.editButton}
              title={t('board:detailsPage.editBoardName')}
            >
              <PencilLine size={16} />
              {t('board:detailsPage.editBoardName')}
            </Button>
          ) : undefined
        }
      >
        <PictureManager
          imageUrl={boardDetails.pictureUrl}
          defaultImage={defaultBoardImage}
          altText={boardDetails.name}
          onUpload={onPictureUpload}
          onDelete={currentUserIsAdmin ? onDeletePicture : undefined}
          showDeleteButton={currentUserIsAdmin}
          uploadButtonText={t('board:detailsPage.changePicture')}
          deleteButtonText={t('board:detailsPage.deletePicture')}
          className={styles.pictureManager}
        />
      </SectionCard>

      <SectionCard
        title={t('board:detailsPage.boardDescription')}
        variant="default"
        headerActions={
          currentUserIsAdmin && !isEditingDescription ? (
            <Button
              onClick={() => setIsEditingDescription(true)}
              variant="secondary"
              className={styles.editButton}
            >
              <PencilLine size={16} />
              {t('board:detailsPage.editDescription')}
            </Button>
          ) : undefined
        }
      >
        {isEditingDescription ? (
          <div className={styles.editForm}>
            <div>
              <Textarea
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                placeholder={t('board:detailsPage.descriptionPlaceholder')}
                disabled={isUpdating}
                rows={4}
                className={styles.descriptionTextarea}
              />
            </div>
            <div className={styles.buttonGroup}>
              <Button
                onClick={handleCancelDescriptionEdit}
                disabled={isUpdating}
                variant="secondary"
              >
                <X size={16} />
                {t('common:button.cancel')}
              </Button>
              <Button onClick={handleSaveDescription} disabled={isUpdating} variant="primary">
                <Save size={16} />
                {isUpdating ? t('common:button.saving') : t('common:button.save')}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {boardDetails.description ? (
              <p className={styles.description}>{boardDetails.description}</p>
            ) : (
              <div className={styles.emptyDescription}>
                <label className={styles.emptyDescriptionLabel}>
                  {t('board:detailsPage.noDescription')}
                </label>
                {currentUserIsAdmin && (
                  <label className={styles.emptyDescriptionLabel}>
                    {t('board:detailsPage.noDescriptionHint')}
                  </label>
                )}
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </>
  );
};

export default BoardDetailsHeader;
