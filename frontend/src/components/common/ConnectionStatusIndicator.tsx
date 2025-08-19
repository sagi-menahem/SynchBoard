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
          text: 'Online',
          className: styles.connected,
          ariaLabel: 'Connected to server',
        };
      case 'connecting':
        return {
          icon: '🔄',
          text: 'Reconnecting',
          className: styles.connecting,
          ariaLabel: 'Reconnecting to server',
        };
      case 'disconnected':
        return {
          icon: '⚠️',
          text: 'Offline',
          className: styles.disconnected,
          ariaLabel: 'Disconnected from server - limited functionality',
        };
      default:
        return {
          icon: '⚠️',
          text: 'Offline',
          className: styles.disconnected,
          ariaLabel: 'Disconnected from server - limited functionality',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div 
      className={`${styles.container} ${statusConfig.className} ${className || ''}`}
      title={statusConfig.ariaLabel}
      role="status"
      aria-live="polite"
      aria-label={statusConfig.ariaLabel}
    >
      <span className={styles.icon} aria-hidden="true">
        {statusConfig.icon}
      </span>
      <span className={styles.text}>{statusConfig.text}</span>
    </div>
  );
};