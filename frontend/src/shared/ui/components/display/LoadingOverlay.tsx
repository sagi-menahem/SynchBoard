import React from 'react';

import styles from './LoadingOverlay.module.scss';

interface LoadingOverlayProps {
  message: string;
}

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
