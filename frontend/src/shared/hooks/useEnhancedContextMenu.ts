import { useState, useCallback } from 'react';
import { useContextMenuProvider } from '../ui/components/overlays/ContextMenuProvider';

export const useEnhancedContextMenu = <T>() => {
  const { showContextMenu, hideContextMenu, isOpen } = useContextMenuProvider();
  const [data, setData] = useState<T | null>(null);

  const handleContextMenu = useCallback((
    event: React.MouseEvent, 
    contextData: T,
    content: React.ReactNode,
    onClose?: () => void
  ) => {
    event.preventDefault();
    
    const handleMenuClose = () => {
      setData(null);
      onClose?.();
    };

    setData(contextData);
    showContextMenu(
      event.clientX,
      event.clientY,
      content,
      handleMenuClose
    );
  }, [showContextMenu]);

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