import React from 'react';

import styles from './LoadingOverlay.module.scss';

interface LoadingOverlayProps {
  /** Descriptive text displayed below the loading spinner */
  message: string;
}

/**
 * Full-screen loading overlay that blocks user interaction during async operations.
 * Provides clear visual feedback with an animated spinner and contextual message
 * to inform users about ongoing background processes.
 *
 * @param message - Descriptive text displayed below the loading spinner
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingContent}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
