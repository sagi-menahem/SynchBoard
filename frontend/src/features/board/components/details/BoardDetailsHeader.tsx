
import React, { useRef, useState } from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import { PencilLine, Save, Trash2, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL, APP_CONFIG } from 'shared/constants';
import { Button } from 'shared/ui';

import styles from './BoardDetailsHeader.module.css';

interface BoardDetailsHeaderProps {
    boardDetails: BoardDetails;
    currentUserIsAdmin: boolean;
    onPictureUpload: (file: File) => void;
    onUpdateDescription: (description: string) => Promise<void>;
    onDeletePicture: () => void;
}

const BoardDetailsHeader: React.FC<BoardDetailsHeaderProps> = (props) => {
    const { t } = useTranslation(['board', 'common']);
    const {
        boardDetails,
        currentUserIsAdmin,
        onPictureUpload,
        onUpdateDescription,
        onDeletePicture,
    } = props;

    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [descriptionValue, setDescriptionValue] = useState(boardDetails.description || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const imageSource = boardDetails.pictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${boardDetails.pictureUrl}`
        : defaultBoardImage;

    const handleCancelDescriptionEdit = () => {
        setDescriptionValue(boardDetails.description || '');
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onPictureUpload(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <div className={styles.section}>
                <div className={styles.imageContainer}>
                    <img
                        src={imageSource}
                        alt={boardDetails.name}
                        className={styles.boardImage}
                    />
                </div>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept={APP_CONFIG.ALLOWED_IMAGE_TYPES}
                />
                
                {currentUserIsAdmin && (
                    <div className={styles.buttonGroup}>
                        <Button 
                            onClick={triggerFileInput}
                            variant="secondary"
                        >
                            <Upload size={16} />
                            {t('board:detailsPage.changePicture')}
                        </Button>
                        <Button 
                            onClick={onDeletePicture}
                            variant="destructive"
                        >
                            <Trash2 size={16} />
                            {t('board:detailsPage.deletePicture')}
                        </Button>
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{t('board:detailsPage.boardDescription')}</h2>
                    {currentUserIsAdmin && !isEditingDescription && (
                        <Button 
                            onClick={() => setIsEditingDescription(true)}
                            variant="secondary"
                            className={styles.editButton}
                        >
                            <PencilLine size={16} />
                            {t('board:detailsPage.editDescription')}
                        </Button>
                    )}
                </div>
                
                {isEditingDescription ? (
                    <div className={styles.editForm}>
                        <div className={styles.formField}>
                            <textarea
                                value={descriptionValue}
                                onChange={(e) => setDescriptionValue(e.target.value)}
                                placeholder={t('board:detailsPage.descriptionPlaceholder')}
                                disabled={isUpdating}
                                rows={4}
                                className={styles.descriptionTextarea}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <Button 
                                onClick={handleCancelDescriptionEdit}
                                disabled={isUpdating}
                                variant="secondary"
                                className={styles.cancelButton}
                            >
                                <X size={16} />
                                {t('common:button.cancel')}
                            </Button>
                            <Button 
                                onClick={handleSaveDescription}
                                disabled={isUpdating}
                                variant="primary"
                                className={styles.saveButton}
                            >
                                <Save size={16} />
                                {isUpdating ? t('common:button.saving') : t('common:button.save')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.descriptionContent}>
                        <p className={styles.description}>
                            {boardDetails.description || t('board:detailsPage.noDescription')}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default BoardDetailsHeader;
