import React from 'react';

import styles from './BoardWorkspaceSkeleton.module.scss';
import Skeleton from './Skeleton';

/**
 * Skeleton placeholder for the Board workspace canvas area during loading states.
 * Shows a large canvas placeholder with a floating toolbar skeleton.
 */
const BoardWorkspaceSkeleton: React.FC = () => {
  return (
    <div className={styles.workspaceSkeleton}>
      {/* Canvas area skeleton */}
      <Skeleton variant="rounded" className={styles.canvasArea} />

      {/* Floating toolbar skeleton */}
      <div className={styles.toolbarSkeleton}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="circular" className={styles.toolButton} />
        ))}
      </div>
    </div>
  );
};

export default BoardWorkspaceSkeleton;
