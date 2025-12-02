import type { ViewMode } from 'features/board/types/ToolbarTypes';
import React from 'react';

import BoardCardSkeleton from './BoardCardSkeleton';

import styles from './BoardListSkeleton.module.scss';

/**
 * Props for BoardListSkeleton component.
 */
interface BoardListSkeletonProps {
  /** Number of skeleton cards to display */
  count?: number;
  /** Display mode: grid or list */
  viewMode?: ViewMode;
}

/**
 * Skeleton placeholder for the board list during loading states.
 * Renders multiple BoardCardSkeleton components in a grid or list layout.
 *
 * @param count - Number of skeleton cards (default: 6 for grid, 5 for list)
 * @param viewMode - Display layout mode
 */
const BoardListSkeleton: React.FC<BoardListSkeletonProps> = ({ count, viewMode = 'grid' }) => {
  const defaultCount = viewMode === 'grid' ? 6 : 5;
  const skeletonCount = count ?? defaultCount;

  return (
    <div className={`${styles.boardListSkeleton} ${styles[viewMode]}`}>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <BoardCardSkeleton key={index} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default BoardListSkeleton;
