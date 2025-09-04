import { useState, useCallback } from 'react';

import { useContextMenuProvider } from '../ui/components/overlays/ContextMenuProvider';

/**
 * Enhanced custom hook for managing context menus with centralized provider support.
 * Extends basic context menu functionality by integrating with a global context menu provider,
 * allowing for more sophisticated menu rendering and positioning. Supports custom content
 * and cleanup callbacks for advanced use cases.
 * 
 * @returns {Object} Object containing menu state, associated data, and enhanced control functions
 */
export const useEnhancedContextMenu = <T>() => {
  const { showContextMenu, hideContextMenu, isOpen } = useContextMenuProvider();
  const [data, setData] = useState<T | null>(null);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, contextData: T, content: React.ReactNode, onClose?: () => void) => {
      event.preventDefault();

      const handleMenuClose = () => {
        setData(null);
        onClose?.();
      };

      // Store data and show menu at mouse coordinates with custom content
      setData(contextData);
      showContextMenu(event.clientX, event.clientY, content, handleMenuClose);
    },
    [showContextMenu],
  );

  const closeMenu = useCallback(() => {
    hideContextMenu();
    setData(null);
  }, [hideContextMenu]);

  return {
    isOpen,
    data,
    handleContextMenu,
    closeMenu,
  };
};
