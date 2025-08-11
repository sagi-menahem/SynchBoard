import React from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Button from 'components/common/Button';
import { APP_ROUTES } from 'constants/RoutesConstants';

import styles from './BoardHeader.module.css';

interface BoardHeaderProps {
    boardId: number;
    boardName: string | null;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({ boardId, boardName }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.header}>
            <div className={styles.headerTitle}>
                <Link to={APP_ROUTES.BOARD_LIST}>
                    <Button>&larr; {t('boardPage.backButton')}</Button>
                </Link>
                <Link to={APP_ROUTES.getBoardDetailsRoute(boardId)} className={styles.headerLink}>
                    <h1>{boardName || t('boardPage.loading')}</h1>
                </Link>
            </div>
        </div>
    );
};

export default BoardHeader;
