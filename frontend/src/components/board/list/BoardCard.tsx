import { API_BASE_URL, APP_ROUTES } from 'constants';

import React, { useMemo } from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Board } from 'types';

import styles from './BoardCard.module.css';

interface BoardCardProps {
    board: Board;
}

const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
    const { t } = useTranslation();

    // Memoize image source calculation to prevent unnecessary recalculation
    const imageSource = useMemo(() => {
        return board.pictureUrl ? `${API_BASE_URL.replace('/api', '')}${board.pictureUrl}` : defaultBoardImage;
    }, [board.pictureUrl]);

    return (
        <Link to={APP_ROUTES.getBoardDetailRoute(board.id)} className={styles.boardCard}>
            <img src={imageSource} alt={board.name} className={styles.boardCardImage} />
            <div className={styles.boardCardContent}>
                <h2>{board.name}</h2>
                <p>{board.description || t('boardListPage.noDescription')}</p>
                {board.isAdmin && <span className={styles.adminLabel}>{t('boardListPage.adminLabel')}</span>}
            </div>
        </Link>
    );
};

export default React.memo(BoardCard);
