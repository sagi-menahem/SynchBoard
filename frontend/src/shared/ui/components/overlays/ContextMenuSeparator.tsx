import React from 'react';

import styles from './EnhancedContextMenu.module.scss';

/**
 * Visual separator component for context menus.
 * Renders a horizontal line to group related menu items and improve visual organization.
 * Provides semantic separation with proper ARIA role for screen readers.
 */
export const ContextMenuSeparator: React.FC = () => {
  return <div className={styles.separator} role="separator" />;
};
