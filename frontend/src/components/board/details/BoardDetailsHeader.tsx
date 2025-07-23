// File: frontend/src/components/board/BoardDetailsHeader.tsx
import defaultBoardImage from 'assets/default-board-image.png';
import Button from 'components/common/Button';
import { API_BASE_URL } from 'constants/api.constants';
import { APP_ROUTES } from 'constants/routes.constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { BoardDetails } from 'types/board.types';
import styles from './BoardDetailsHeader.module.css';

interface BoardDetailsHeaderProps {
    boardDetails: BoardDetails;
    currentUserIsAdmin: boolean;
    numericBoardId: number;
    onSetPictureModalOpen: (isOpen: boolean) => void;
    onSetEditingField: (field: 'name' | 'description' | null) => void;
    onSetLeaveConfirmOpen: (isOpen: boolean) => void;
    onSetInviteModalOpen: (isOpen: boolean) => void;
}

const BoardDetailsHeader: React.FC<BoardDetailsHeaderProps> = (props) => {
    const { t } = useTranslation();
    const { boardDetails, currentUserIsAdmin, numericBoardId, onSetPictureModalOpen, onSetEditingField, onSetLeaveConfirmOpen, onSetInviteModalOpen } = props;

    const imageSource = boardDetails.pictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${boardDetails.pictureUrl}`
        : defaultBoardImage;

    return (
        <>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <img
                        src={imageSource}
                        alt={`${boardDetails.name} picture`}
                        className={styles.boardImage}
                        onClick={() => onSetPictureModalOpen(true)}
                    />
                    <div>
                        <h1 className={styles.editableText} onClick={() => onSetEditingField('name')}>
                            {boardDetails.name}
                        </h1>
                        <p className={`${styles.description} ${styles.editableText}`} onClick={() => onSetEditingField('description')}>
                            {boardDetails.description || t('boardDetailsPage.noDescription')}
                        </p>
                    </div>
                </div>
                <Link to={APP_ROUTES.getBoardDetailRoute(numericBoardId)}>
                    <Button variant="secondary">&larr; {t('boardDetailsPage.backToBoardButton')}</Button>
                </Link>
            </div>

            <div className={styles.header}>
                <h2>{t('boardDetailsPage.membersHeader')}</h2>
                <div className={styles.headerActions}>
                    <Button onClick={() => onSetLeaveConfirmOpen(true)} className={styles.destructiveButton}>
                        {t('leaveBoard.button')}
                    </Button>
                    {currentUserIsAdmin && (
                        <Button onClick={() => onSetInviteModalOpen(true)}>{t('boardDetailsPage.inviteButton')}</Button>
                    )}
                </div>
            </div>
        </>
    );
};

export default BoardDetailsHeader;