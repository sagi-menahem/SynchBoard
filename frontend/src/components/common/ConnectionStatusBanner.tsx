import React, { useEffect, useState } from 'react';

import { useSocket } from 'hooks/common';

import styles from './ConnectionStatusBanner.module.css';

export const ConnectionStatusBanner: React.FC = () => {
  const { connectionState } = useSocket();
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);

  useEffect(() => {
    // Track if we've ever been connected to avoid showing banner on initial load
    if (connectionState === 'connected') {
      setHasConnectedOnce(true);
    }
  }, [connectionState]);

  // Only show banner if we were connected before AND are now disconnected
  // This prevents showing "Connection lost" on initial page load
  const showBanner = hasConnectedOnce && connectionState === 'disconnected';

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`${styles.banner} ${styles.disconnected}`}>
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          ⚠️
        </span>
        <span className={styles.message}>
          Connection lost - limited functionality
        </span>
      </div>
    </div>
  );
};