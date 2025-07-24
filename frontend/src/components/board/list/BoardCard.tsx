// File: frontend/src/components/board/BoardCard.tsx
import defaultBoardImage from 'assets/default-board-image.png';
import { API_BASE_URL } from 'constants/api.constants';
import { APP_ROUTES } from 'constants/routes.constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Board } from 'types/board.types';
import styles from './BoardCard.module.css';

interface BoardCardProps {
    board: Board;
}

const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
    const { t } = useTranslation();

    const imageSource = board.pictureUrl ? `${API_BASE_URL.replace('/api', '')}${board.pictureUrl}` : defaultBoardImage;

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

export default BoardCard;
