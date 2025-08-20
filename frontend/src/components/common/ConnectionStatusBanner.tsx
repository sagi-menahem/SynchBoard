import React, { useEffect, useState } from 'react';

import { useSocket } from 'hooks/common';

import styles from './ConnectionStatusBanner.module.css';

export const ConnectionStatusBanner: React.FC = () => {
  const { connectionState } = useSocket();
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);
  const [connectionHistory, setConnectionHistory] = useState<string[]>([]);

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[BANNER ${timestamp}] Component mounted, initial connection state:`, connectionState);

    return () => {
      console.log(`[BANNER ${new Date().toISOString()}] Component unmounting`);
    };
  }, [connectionState]);

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[BANNER ${timestamp}] Connection state changed to:`, connectionState);
    
    // Track connection history for debugging
    setConnectionHistory((prev) => [...prev, `${timestamp}: ${connectionState}`].slice(-5));
    
    if (connectionState === 'connected' && !hasConnectedOnce) {
      console.log(`[BANNER ${timestamp}] First successful connection detected`);
      setHasConnectedOnce(true);
    }
  }, [connectionState, hasConnectedOnce]);

  // FIXED LOGIC: Only show banner after successful connection AND real disconnection
  // This prevents showing on initial load when no connection ever succeeded
  const showBanner = hasConnectedOnce && connectionState === 'disconnected';

  const timestamp = new Date().toISOString();
  console.log(`[BANNER ${timestamp}] Render - hasConnectedOnce:`, hasConnectedOnce, 'connectionState:', connectionState, 'showBanner:', showBanner);
  console.log(`[BANNER ${timestamp}] Connection History:`, connectionHistory);

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