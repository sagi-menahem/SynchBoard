
import React, { useMemo } from 'react';

import defaultBoardImage from 'assets/default-board-image.png';
import clsx from 'clsx';
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

const BoardCard: React.FC<BoardCardProps> = React.memo(({ board, viewMode = 'grid' }) => {
  const { t } = useTranslation(['board', 'common']);

  const imageSource = useMemo(() => 
    board.pictureUrl ? `${API_BASE_URL.replace('/api', '')}${board.pictureUrl}` : defaultBoardImage,
    [board.pictureUrl],
  );
  
  const colorDisplayName = useMemo(() => {
    const colorName = getColorName(board.canvasBackgroundColor);
    return colorName ? t(`common:colors.${colorName}`) : board.canvasBackgroundColor;
  }, [board.canvasBackgroundColor, t]);

  const canvasResolution = useMemo(() => 
    formatCanvasResolution(board.canvasWidth, board.canvasHeight, t),
    [board.canvasWidth, board.canvasHeight, t],
  );

  const cardClasses = useMemo(() => 
    clsx(styles.boardCard, styles[viewMode]),
    [viewMode],
  );

  const boardRoute = useMemo(() => 
    APP_ROUTES.getBoardDetailRoute(board.id),
    [board.id],
  );

  return (
    <Link 
      to={boardRoute} 
      className={styles.cardLink}
    >
      <Card 
        variant="elevated" 
        hoverable
        className={cardClasses}
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
});

BoardCard.displayName = 'BoardCard';

export default BoardCard;
