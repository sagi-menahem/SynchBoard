import React from 'react';

import styles from './ContextMenu.module.css';

interface ContextMenuItemProps {
    onClick: () => void;
    children: React.ReactNode;
    destructive?: boolean;
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({ onClick, children, destructive = false }) => {
  const itemClasses = `${styles.item} ${destructive ? styles.destructive : ''}`;

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
      {children}
    </div>
  );
};
