import React from 'react';

import styles from './EnhancedContextMenu.module.scss';

interface ContextMenuItemProps {
  onClick: () => void;
  children: React.ReactNode;
  destructive?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'destructive';
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  onClick,
  children,
  destructive = false,
  icon,
  variant,
}) => {
  const finalVariant = variant ?? (destructive ? 'destructive' : 'default');
  const itemClasses = `${styles.item} ${styles[finalVariant]}`;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={itemClasses}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={0}
    >
      <div className={styles.itemContent}>
        {icon && <div className={styles.itemIcon}>{icon}</div>}
        <div className={styles.itemText}>{children}</div>
      </div>
    </div>
  );
};
