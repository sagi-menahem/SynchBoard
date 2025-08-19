import React from 'react';

import { useSocket } from 'hooks/common';

import styles from './ConnectionStatusBanner.module.css';

export const ConnectionStatusBanner: React.FC = () => {
  const { connectionState } = useSocket();

  // Don't show banner when connected
  if (connectionState === 'connected') {
    return null;
  }

  const getBannerConfig = () => {
    switch (connectionState) {
      case 'connecting':
        return {
          message: 'Reconnecting...',
          className: styles.connecting,
          icon: '🔄',
        };
      case 'disconnected':
        return {
          message: 'Connection lost - limited functionality',
          className: styles.disconnected,
          icon: '⚠️',
        };
      default:
        return {
          message: 'Connection lost - limited functionality',
          className: styles.disconnected,
          icon: '⚠️',
        };
    }
  };

  const bannerConfig = getBannerConfig();

  return (
    <div className={`${styles.banner} ${bannerConfig.className}`}>
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {bannerConfig.icon}
        </span>
        <span className={styles.message}>
          {bannerConfig.message}
        </span>
      </div>
    </div>
  );
};