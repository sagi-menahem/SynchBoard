import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { EnhancedContextMenu } from './EnhancedContextMenu';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  content: ReactNode | null;
  onClose: () => void;
}

interface ContextMenuContextType {
  showContextMenu: (x: number, y: number, content: ReactNode, onClose?: () => void) => void;
  hideContextMenu: () => void;
  isOpen: boolean;
}

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

interface ContextMenuProviderProps {
  children: ReactNode;
}

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({ children }) => {
  const [menuState, setMenuState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    content: null,
    onClose: () => {},
  });

  const showContextMenu = (x: number, y: number, content: ReactNode, onClose?: () => void) => {
    const handleClose = () => {
      hideContextMenu();
      onClose?.();
    };

    setMenuState({
      isOpen: true,
      x,
      y,
      content,
      onClose: handleClose,
    });
  };

  const hideContextMenu = () => {
    setMenuState(prev => ({
      ...prev,
      isOpen: false,
      content: null,
    }));
  };

  const contextValue: ContextMenuContextType = {
    showContextMenu,
    hideContextMenu,
    isOpen: menuState.isOpen,
  };

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
      {menuState.isOpen && menuState.content && createPortal(
        <EnhancedContextMenu
          x={menuState.x}
          y={menuState.y}
          onClose={menuState.onClose}
        >
          {menuState.content}
        </EnhancedContextMenu>,
        document.body
      )}
    </ContextMenuContext.Provider>
  );
};

export const useContextMenuProvider = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenuProvider must be used within a ContextMenuProvider');
  }
  return context;
};