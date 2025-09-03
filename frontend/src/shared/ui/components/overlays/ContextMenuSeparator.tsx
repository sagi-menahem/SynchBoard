import React from 'react';

import styles from './EnhancedContextMenu.module.scss';

export const ContextMenuSeparator: React.FC = () => {
  return <div className={styles.separator} role="separator" />;
};