
import React from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import type { Board } from 'features/board/types/BoardTypes';
import type { ViewMode } from 'features/board/types/ToolbarTypes';
import { formatCanvasResolution } from 'features/board/utils/CanvasUtils';
import { Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { API_BASE_URL, APP_ROUTES } from 'shared/constants';
import { Card, RelativeTimestamp } from 'shared/ui';
import { getColorName } from 'shared/utils/ColorUtils';

import styles from './BoardCard.module.scss';

interface BoardCardProps {
    board: Board;
    viewMode?: ViewMode;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, viewMode = 'grid' }) => {
  const { t } = useTranslation(['board', 'common']);

  const imageSource = board.pictureUrl ? `${API_BASE_URL.replace('/api', '')}${board.pictureUrl}` : defaultBoardImage;
  
  const colorName = getColorName(board.canvasBackgroundColor);
  const colorDisplayName = colorName ? t(`common:colors.${colorName}`) : board.canvasBackgroundColor;
  const canvasResolution = formatCanvasResolution(board.canvasWidth, board.canvasHeight, t);

  return (
    <Link 
      to={APP_ROUTES.getBoardDetailRoute(board.id)} 
      className={styles.cardLink}
    >
      <Card 
        variant="elevated" 
        hoverable={true}
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
          <p className={styles.description}>{board.description ?? t('board:listPage.noDescription')}</p>
          <div className={styles.resolutionInfo}>
            <span className={styles.canvasResolution}>{canvasResolution}</span>
          </div>
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.leftSection} />
          <div className={styles.centerSection}>
            {board.isAdmin && (
              <div className={styles.adminLabel} title={t('board:listPage.adminLabel')}>
                <Crown size={18} />
              </div>
            )}
          </div>
          <div className={styles.rightSection}>
            <RelativeTimestamp
              timestamp={board.lastModifiedDate}
              className={styles.lastModified}
            />
          </div>
        </div>
      </div>
      </Card>
    </Link>
  );
};

export default BoardCard;
