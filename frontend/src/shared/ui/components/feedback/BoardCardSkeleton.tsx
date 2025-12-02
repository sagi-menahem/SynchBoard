import type { ViewMode } from 'features/board/types/ToolbarTypes';
import React from 'react';

import styles from './BoardCardSkeleton.module.scss';
import Skeleton from './Skeleton';

/**
 * Props for BoardCardSkeleton component.
 */
interface BoardCardSkeletonProps {
  /** Display mode matching the BoardCard component */
  viewMode?: ViewMode;
}

/**
 * Skeleton placeholder for BoardCard component during loading states.
 * Matches the exact layout structure of BoardCard for both grid and list views.
 *
 * @param viewMode - Display mode: 'grid' or 'list'
 */
const BoardCardSkeleton: React.FC<BoardCardSkeletonProps> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'grid') {
    return (
      <div className={styles.gridCard}>
        <div className={styles.gridPreviewArea}>
          <Skeleton variant="circular" className={styles.gridAvatar} />
        </div>
        <div className={styles.gridContent}>
          <Skeleton variant="text" className={styles.gridTitle} />
          <div className={styles.gridMeta}>
            <Skeleton variant="circular" className={styles.gridColorDot} />
            <Skeleton variant="text" className={styles.gridResolution} />
          </div>
          <Skeleton variant="text" className={styles.gridTimestamp} />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className={styles.listCard}>
      <div className={styles.listLeftSection}>
        <Skeleton variant="circular" className={styles.listThumbnail} />
        <Skeleton variant="text" className={styles.listName} />
      </div>
      <div className={styles.listCenterInfo}>
        <Skeleton variant="text" className={styles.listResolution} />
        <div className={styles.listColorInfo}>
          <Skeleton variant="circular" className={styles.listColorDot} />
          <Skeleton variant="text" className={styles.listColorName} />
        </div>
      </div>
      <Skeleton variant="text" className={styles.listTimestamp} />
    </div>
  );
};

export default BoardCardSkeleton;
