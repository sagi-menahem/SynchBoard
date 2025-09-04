import React, { useEffect, useRef, useState } from 'react';

import styles from './EnhancedContextMenu.module.scss';

/**
 * Props for the EnhancedContextMenu component.
 */
interface EnhancedContextMenuProps {
  x: number; // Horizontal position for the context menu
  y: number; // Vertical position for the context menu
  onClose: () => void; // Callback when menu should be closed
  children: React.ReactNode; // Menu items and content to display
}

/**
 * Internal interface for tracking menu positioning and overflow handling.
 */
interface MenuPosition {
  x: number; // Calculated horizontal position
  y: number; // Calculated vertical position
  flipX: boolean; // Whether menu is flipped horizontally to avoid overflow
  flipY: boolean; // Whether menu is flipped vertically to avoid overflow
}

/**
 * Enhanced context menu component with intelligent positioning and animations.
 * Automatically adjusts position to prevent viewport overflow and provides smooth entrance animations.
 * Supports keyboard navigation and click-outside behavior for improved user experience.
 * 
 * @param {number} x - Initial horizontal position for the context menu
 * @param {number} y - Initial vertical position for the context menu
 * @param {function} onClose - Callback function called when menu should be closed
 * @param {React.ReactNode} children - Menu items and content to display inside the menu
 */
export const EnhancedContextMenu: React.FC<EnhancedContextMenuProps> = ({
  x,
  y,
  onClose,
  children,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition>({ x, y, flipX: false, flipY: false });
  const [isVisible, setIsVisible] = useState(false);

  // Calculate optimal positioning to prevent viewport overflow
  useEffect(() => {
    if (!menuRef.current) {
      return;
    }

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const wouldOverflowRight = x + menuRect.width > viewportWidth - 10; // 10px viewport margin prevents edge clipping
    const wouldOverflowBottom = y + menuRect.height > viewportHeight - 10; // 10px viewport margin prevents edge clipping

    let adjustedX = x;
    let adjustedY = y;
    let flipX = false;
    let flipY = false;

    if (wouldOverflowRight) {
      adjustedX = x - menuRect.width;
      flipX = true;
    }

    if (wouldOverflowBottom) {
      adjustedY = y - menuRect.height;
      flipY = true;
    }

    adjustedX = Math.max(10, adjustedX); // Minimum 10px from viewport edge to prevent clipping
    adjustedY = Math.max(10, adjustedY); // Minimum 10px from viewport top to ensure visibility

    setPosition({ x: adjustedX, y: adjustedY, flipX, flipY });

    // Small delay to ensure smooth animation timing
    setTimeout(() => setIsVisible(true), 10);
  }, [x, y]);

  // Handle click-outside and keyboard navigation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Delay event listeners to prevent immediate closure on initial click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 100); // Brief delay prevents immediate closure from the same click that opened the menu

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuClasses = [
    styles.menu,
    isVisible ? styles.visible : styles.hidden,
    position.flipX ? styles.flipX : '',
    position.flipY ? styles.flipY : '',
  ]
    .filter(Boolean)
    .join(' ');

  const style = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return (
    <div ref={menuRef} className={menuClasses} style={style} role="menu" aria-hidden={!isVisible}>
      {children}
    </div>
  );
};
