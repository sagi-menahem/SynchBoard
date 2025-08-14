import React from 'react';

import { useSocket } from 'hooks/common';

import styles from './ConnectionStatusIndicator.module.css';

interface ConnectionStatusIndicatorProps {
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ className }) => {
  const { connectionState } = useSocket();

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: '🟢',
          text: 'Connected',
          className: styles.connected,
        };
      case 'connecting':
        return {
          icon: '🟡',
          text: 'Connecting',
          className: styles.connecting,
        };
      case 'disconnected':
        return {
          icon: '🔴',
          text: 'Disconnected',
          className: styles.disconnected,
        };
      default:
        return {
          icon: '🔴',
          text: 'Disconnected',
          className: styles.disconnected,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`${styles.container} ${statusConfig.className} ${className || ''}`}>
      <span className={styles.icon} aria-hidden="true">
        {statusConfig.icon}
      </span>
      <span className={styles.text}>{statusConfig.text}</span>
    </div>
  );
};