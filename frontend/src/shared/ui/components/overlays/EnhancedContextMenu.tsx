import React, { useEffect, useRef, useState } from 'react';

import styles from './EnhancedContextMenu.module.scss';

interface EnhancedContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  children: React.ReactNode;
}

interface MenuPosition {
  x: number;
  y: number;
  flipX: boolean;
  flipY: boolean;
}

export const EnhancedContextMenu: React.FC<EnhancedContextMenuProps> = ({
  x,
  y,
  onClose,
  children,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition>({ x, y, flipX: false, flipY: false });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!menuRef.current) {
      return;
    }

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const wouldOverflowRight = x + menuRect.width > viewportWidth - 10;
    const wouldOverflowBottom = y + menuRect.height > viewportHeight - 10;

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

    adjustedX = Math.max(10, adjustedX);
    adjustedY = Math.max(10, adjustedY);

    setPosition({ x: adjustedX, y: adjustedY, flipX, flipY });

    setTimeout(() => setIsVisible(true), 10);
  }, [x, y]);

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

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 100);

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
