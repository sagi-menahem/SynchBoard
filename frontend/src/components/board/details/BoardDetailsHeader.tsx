import React from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import { Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from 'constants/ApiConstants';
import type { BoardDetails } from 'types/BoardTypes';

import styles from './BoardDetailsHeader.module.css';

interface BoardDetailsHeaderProps {
    boardDetails: BoardDetails;
    currentUserIsAdmin: boolean;
    onSetPictureModalOpen: (isOpen: boolean) => void;
    onSetEditingField: (field: 'name' | 'description' | null) => void;
}

const BoardDetailsHeader: React.FC<BoardDetailsHeaderProps> = (props) => {
    const { t } = useTranslation();
    const {
        boardDetails,
        currentUserIsAdmin,
        onSetPictureModalOpen,
        onSetEditingField,
    } = props;

    const imageSource = boardDetails.pictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${boardDetails.pictureUrl}`
        : defaultBoardImage;

    return (
        <div className={styles.cleanHeader}>
            {/* Compact Board Image */}
            <button
                type="button"
                className={styles.compactImageButton}
                onClick={() => onSetPictureModalOpen(true)}
                aria-label={t('boardDetailsPage.changeBoardImage')}
            >
                <img
                    src={imageSource}
                    alt={boardDetails.name}
                    className={styles.compactBoardImage}
                />
            </button>
            
            {/* Centered, elegant description */}
            <div className={styles.descriptionContainer}>
                <button
                    type="button"
                    className={styles.descriptionButton}
                    onClick={() => onSetEditingField('description')}
                    aria-label={t('boardDetailsPage.editBoardDescription')}
                >
                    <p className={styles.elegantDescription}>
                        {boardDetails.description || t('boardDetailsPage.noDescription')}
                    </p>
                    {currentUserIsAdmin && (
                        <Edit size={16} className={styles.editIcon} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default BoardDetailsHeader;
