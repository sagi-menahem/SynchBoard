import { useState } from 'react';

/**
 * Custom hook for managing context menu (right-click menu) functionality.
 * Provides state management for menu position, visibility, and associated data.
 * Handles right-click events to show the menu at cursor position and manages
 * menu lifecycle including opening and closing operations.
 * 
 * @returns {Object} Object containing menu state, position coordinates, data, and control functions
 */
export const useContextMenu = <T>() => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const [data, setData] = useState<T | null>(null);

  const handleContextMenu = (event: React.MouseEvent, contextData: T) => {
    event.preventDefault();

    // Set menu position to mouse coordinates and store associated data
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    setData(contextData);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setData(null);
  };

  return {
    anchorPoint,
    isOpen,
    data,
    handleContextMenu,
    closeMenu,
  };
};
