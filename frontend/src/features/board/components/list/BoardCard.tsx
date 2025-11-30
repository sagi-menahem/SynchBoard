import defaultBoardImage from 'assets/default-board-image.png';
import clsx from 'clsx';
import type { Board } from 'features/board/types/BoardTypes';
import type { ViewMode } from 'features/board/types/ToolbarTypes';
import { formatCanvasResolution } from 'features/board/utils/CanvasUtils';
import { Crown } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { API_BASE_URL, APP_ROUTES } from 'shared/constants';
import { Card, RelativeTimestamp } from 'shared/ui';
import { getColorName } from 'shared/utils/ColorUtils';

import styles from './BoardCard.module.scss';

/**
 * Props interface for BoardCard component.
 * Defines the board data and display configuration for individual board cards.
 */
interface BoardCardProps {
  /** Board data including name, description, canvas settings, and metadata */
  board: Board;
  /** Display mode for the card layout - either grid or list view */
  viewMode?: ViewMode;
}

/**
 * Displays individual board information as an interactive card with navigation link.
 * This memoized component renders board details including picture, name, description, 
 * canvas configuration, and admin status in either grid or list layout modes.
 * 
 * @param board - Board data including name, description, canvas settings, and metadata
 * @param viewMode - Display mode for the card layout - either grid or list view
 */
const BoardCard: React.FC<BoardCardProps> = React.memo(({ board, viewMode = 'grid' }) => {
  const { t } = useTranslation(['board', 'common']);

  const imageSource = useMemo(
    () =>
      board.pictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${board.pictureUrl}`
        : defaultBoardImage,
    [board.pictureUrl],
  );

  const colorDisplayName = useMemo(() => {
    const colorName = getColorName(board.canvasBackgroundColor);
    return colorName ? t(`common:colors.${colorName}`) : board.canvasBackgroundColor;
  }, [board.canvasBackgroundColor, t]);

  const canvasResolution = useMemo(
    () => formatCanvasResolution(board.canvasWidth, board.canvasHeight, t),
    [board.canvasWidth, board.canvasHeight, t],
  );

  const cardClasses = useMemo(() => clsx(styles.boardCard, styles[viewMode]), [viewMode]);

  const boardRoute = useMemo(() => APP_ROUTES.getBoardDetailRoute(board.id), [board.id]);

  // Grid view: Compact modern card with preview
  if (viewMode === 'grid') {
    return (
      <Link to={boardRoute} className={styles.cardLink}>
        <Card variant="elevated" hoverable className={cardClasses}>
          {/* Preview area with background color and centered avatar */}
          <div
            className={styles.previewArea}
            style={{ backgroundColor: board.canvasBackgroundColor }}
          >
            {/* Centered avatar */}
            <div className={styles.gridAvatar}>
              <img src={imageSource} alt={board.name} className={styles.gridAvatarImage} />
            </div>
            
            {board.isAdmin && (
              <div className={styles.adminBadge} title={t('board:listPage.adminLabel')}>
                <Crown size={14} />
              </div>
            )}
          </div>

          {/* Card content - compact */}
          <div className={styles.boardCardContent}>
            <h3 className={styles.boardName}>{board.name}</h3>
            
            {/* Metadata row */}
            <div className={styles.metadataRow}>
              <div
                className={styles.colorDot}
                style={{ backgroundColor: board.canvasBackgroundColor }}
                title={colorDisplayName}
              />
              <span className={styles.resolutionText}>{canvasResolution}</span>
            </div>

            {/* Timestamp */}
            <RelativeTimestamp
              timestamp={board.lastModifiedDate}
              className={styles.timestamp}
            />
          </div>
        </Card>
      </Link>
    );
  }

  // List view: Modern compact horizontal row
  return (
    <Link to={boardRoute} className={styles.cardLink}>
      <Card variant="elevated" hoverable className={cardClasses}>
        {/* Circular avatar thumbnail */}
        <img 
          src={imageSource} 
          alt={board.name} 
          className={styles.listThumbnail}
        />
        
        {/* Board name */}
        <div className={styles.listName}>
          <h3>{board.name}</h3>
          {board.isAdmin && (
            <div className={styles.listAdminIcon} title={t('board:listPage.adminLabel')}>
              <Crown size={16} />
            </div>
          )}
        </div>

        {/* Color indicator */}
        <div className={styles.listColorInfo}>
          <div
            className={styles.listColorDot}
            style={{ backgroundColor: board.canvasBackgroundColor }}
          />
          <span className={styles.listColorName}>{colorDisplayName}</span>
        </div>

        {/* Resolution */}
        <div className={styles.listResolution}>
          <span>{canvasResolution}</span>
        </div>

        {/* Timestamp */}
        <div className={styles.listTimestamp}>
          <RelativeTimestamp timestamp={board.lastModifiedDate} />
        </div>
      </Card>
    </Link>
  );
});

BoardCard.displayName = 'BoardCard';

export default BoardCard;
