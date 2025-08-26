import { API_BASE_URL, APP_ROUTES } from 'constants';

import React from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Board, ViewMode } from 'types';
import { formatCanvasResolution } from 'utils/CanvasUtils';
import { getColorName } from 'utils/ColorUtils';

import { RelativeTimestamp } from 'components/common';

import styles from './BoardCard.module.css';

interface BoardCardProps {
    board: Board;
    viewMode?: ViewMode;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, viewMode = 'grid' }) => {
  const { t } = useTranslation();

  const imageSource = board.pictureUrl ? `${API_BASE_URL.replace('/api', '')}${board.pictureUrl}` : defaultBoardImage;
  
  const colorName = getColorName(board.canvasBackgroundColor);
  const colorDisplayName = colorName ? t(`colors.${colorName}`) : board.canvasBackgroundColor;
  const canvasResolution = formatCanvasResolution(board.canvasWidth, board.canvasHeight, t);

  return (
    <Link 
      to={APP_ROUTES.getBoardDetailRoute(board.id)} 
      className={`${styles.boardCard} ${styles[viewMode]}`}
    >
      <img src={imageSource} alt={board.name} className={styles.boardCardImage} />
      <div className={styles.boardCardContent}>
        <div className={styles.cardHeader}>
          <h2>{board.name}</h2>
          <div className={styles.metadataColumn}>
            <div className={styles.colorInfo}>
              <span className={styles.colorName}>{colorDisplayName}</span>
              <div 
                className={styles.canvasColorBadge}
                style={{ backgroundColor: board.canvasBackgroundColor }}
                title={colorDisplayName}
              />
            </div>
          </div>
        </div>
        <div className={styles.cardBody}>
          <p className={styles.description}>{board.description || t('boardListPage.noDescription')}</p>
          <div className={styles.resolutionInfo}>
            <span className={styles.canvasResolution}>{canvasResolution}</span>
          </div>
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.leftSection}>
            {/* Empty space for future expansion */}
          </div>
          <div className={styles.centerSection}>
            {board.isAdmin && <span className={styles.adminLabel}>{t('boardListPage.adminLabel')}</span>}
          </div>
          <div className={styles.rightSection}>
            <RelativeTimestamp
              timestamp={board.lastModifiedDate}
              className={styles.lastModified}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BoardCard;
