import React from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import { useTranslation } from 'react-i18next';

import Button from 'components/common/Button';
import { API_BASE_URL } from 'constants/ApiConstants';
import type { BoardDetails } from 'types/BoardTypes';

import styles from './BoardDetailsHeader.module.css';

interface BoardDetailsHeaderProps {
    boardDetails: BoardDetails;
    currentUserIsAdmin: boolean;
    onSetPictureModalOpen: (isOpen: boolean) => void;
    onSetEditingField: (field: 'name' | 'description' | null) => void;
    onDeletePicture: () => void;
}

const BoardDetailsHeader: React.FC<BoardDetailsHeaderProps> = (props) => {
    const { t } = useTranslation();
    const {
        boardDetails,
        currentUserIsAdmin,
        onSetPictureModalOpen,
        onSetEditingField,
        onDeletePicture,
    } = props;

    const imageSource = boardDetails.pictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${boardDetails.pictureUrl}`
        : defaultBoardImage;

    return (
        <>
            {/* Board Picture Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{t('boardDetailsPage.boardPicture')}</h2>
                </div>
                
                <div className={styles.imageContainer}>
                    <img
                        src={imageSource}
                        alt={boardDetails.name}
                        className={styles.boardImage}
                    />
                </div>
                
                {currentUserIsAdmin && (
                    <div className={styles.buttonGroup}>
                        <Button 
                            onClick={() => onSetPictureModalOpen(true)}
                            variant="secondary"
                        >
                            {t('boardDetailsPage.changePicture')}
                        </Button>
                        <Button 
                            onClick={onDeletePicture}
                            variant="secondary"
                            className={styles.destructiveButton}
                        >
                            {t('boardDetailsPage.deletePicture')}
                        </Button>
                    </div>
                )}
            </div>

            {/* Board Description Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{t('boardDetailsPage.boardDescription')}</h2>
                    {currentUserIsAdmin && (
                        <Button 
                            onClick={() => onSetEditingField('description')}
                            variant="secondary"
                        >
                            {t('common.edit')}
                        </Button>
                    )}
                </div>
                
                <div className={styles.descriptionContent}>
                    <p className={styles.description}>
                        {boardDetails.description || t('boardDetailsPage.noDescription')}
                    </p>
                </div>
            </div>
        </>
    );
};

export default BoardDetailsHeader;
