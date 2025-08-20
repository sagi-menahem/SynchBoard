import React from 'react';

import styles from './ConnectionOverlay.module.css';

interface ConnectionOverlayProps {
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({ connectionStatus }) => {
  const isDisconnected = connectionStatus === 'disconnected';

  if (!isDisconnected) {
    return null;
  }

  return (
    <div className={styles.disconnectedOverlay}>
      <div className={styles.disconnectedMessage}>
        <div className={styles.disconnectedIcon}>⚠️</div>
        <div className={styles.disconnectedText}>
          <strong>Connection Lost</strong>
          <p>Cannot draw while disconnected from server</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConnectionOverlay);