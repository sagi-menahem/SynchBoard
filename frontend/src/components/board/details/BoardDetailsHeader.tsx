import React from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Button from 'components/common/Button';
import { API_BASE_URL } from 'constants/api.constants';
import { APP_ROUTES } from 'constants/routes.constants';
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
    const {
        boardDetails,
        currentUserIsAdmin,
        numericBoardId,
        onSetPictureModalOpen,
        onSetEditingField,
        onSetLeaveConfirmOpen,
        onSetInviteModalOpen,
    } = props;

    const imageSource = boardDetails.pictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${boardDetails.pictureUrl}`
        : defaultBoardImage;

    return (
        <>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <button
                        type="button"
                        className={styles.imageButton}
                        onClick={() => onSetPictureModalOpen(true)}
                        aria-label={t('boardDetailsPage.changeBoardImage')}
                    >
                        <img
                            src={imageSource}
                            alt={boardDetails.name}
                            className={styles.boardImage}
                        />
                    </button>
                    <div>
                        <button
                            type="button"
                            className={styles.editableTextButton}
                            onClick={() => onSetEditingField('name')}
                            aria-label={t('boardDetailsPage.editBoardName')}
                        >
                            <h1 className={styles.editableText}>
                                {boardDetails.name}
                            </h1>
                        </button>
                        <button
                            type="button"
                            className={styles.editableTextButton}
                            onClick={() => onSetEditingField('description')}
                            aria-label={t('boardDetailsPage.editBoardDescription')}
                        >
                            <p className={`${styles.description} ${styles.editableText}`}>
                                {boardDetails.description || t('boardDetailsPage.noDescription')}
                            </p>
                        </button>
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
