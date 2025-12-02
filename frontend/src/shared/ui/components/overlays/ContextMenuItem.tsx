import React from 'react';

import styles from './EnhancedContextMenu.module.scss';

/**
 * Props for the ContextMenuItem component.
 */
interface ContextMenuItemProps {
  onClick: () => void; // Callback when item is clicked or activated
  children: React.ReactNode; // Menu item text content
  destructive?: boolean; // Whether this action is destructive (deprecated, use variant)
  icon?: React.ReactNode; // Optional icon to display before text
  variant?: 'default' | 'primary' | 'destructive'; // Visual styling variant
}

/**
 * Individual context menu item component with keyboard navigation support.
 * Provides clickable menu items with optional icons and various visual variants.
 * Supports keyboard navigation and accessibility features for context menus.
 *
 * @param {function} onClick - Callback function called when item is clicked or activated
 * @param {React.ReactNode} children - The text content to display in the menu item
 * @param {boolean} destructive - Whether this action is destructive (deprecated, use variant instead)
 * @param {React.ReactNode} icon - Optional icon element to display before the text content
 * @param {'default' | 'primary' | 'destructive'} variant - Visual styling variant for the menu item
 */
export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  onClick,
  children,
  destructive = false,
  icon,
  variant,
}) => {
  // Resolve final variant, with destructive prop as fallback for backwards compatibility
  const finalVariant = variant ?? (destructive ? 'destructive' : 'default');
  const itemClasses = `${styles.item} ${styles[finalVariant]}`;

  // Handle keyboard activation for accessibility
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
