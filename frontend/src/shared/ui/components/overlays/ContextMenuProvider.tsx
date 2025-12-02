import React, { createContext, useContext, useState, type ReactNode } from 'react';

import { createPortal } from 'react-dom';

import { EnhancedContextMenu } from './EnhancedContextMenu';

/**
 * Internal state for tracking context menu visibility and positioning.
 */
interface ContextMenuState {
  isOpen: boolean; // Whether the context menu is currently visible
  x: number; // Horizontal position of the context menu
  y: number; // Vertical position of the context menu
  content: ReactNode | null; // Menu content to render
  onClose: () => void; // Callback for when menu is closed
}

/**
 * Context API interface for global context menu management.
 */
interface ContextMenuContextType {
  showContextMenu: (x: number, y: number, content: ReactNode, onClose?: () => void) => void; // Show context menu at position
  hideContextMenu: () => void; // Hide currently visible context menu
  isOpen: boolean; // Whether any context menu is currently open
}

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

/**
 * Props for the ContextMenuProvider component.
 */
interface ContextMenuProviderProps {
  children: ReactNode; // Child components that can trigger context menus
}

const noop = (): void => {};

/**
 * Global context menu provider component that manages application-wide context menus.
 * Provides a centralized system for showing context menus at specific coordinates with custom content.
 * Uses React portals to render menus outside the normal component hierarchy for proper z-index layering.
 *
 * @param {React.ReactNode} children - Child components that can trigger context menus
 */
export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({ children }) => {
  const [menuState, setMenuState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    content: null,
    onClose: noop,
  });

  // Display context menu at specified coordinates with custom content
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

  // Hide currently visible context menu
  const hideContextMenu = () => {
    setMenuState((prev) => ({
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
      {menuState.isOpen &&
        menuState.content &&
        createPortal(
          <EnhancedContextMenu x={menuState.x} y={menuState.y} onClose={menuState.onClose}>
            {menuState.content}
          </EnhancedContextMenu>,
          document.body,
        )}
    </ContextMenuContext.Provider>
  );
};

/**
 * Hook to access the global context menu functionality.
 * Must be used within a ContextMenuProvider component.
 *
 * @returns {ContextMenuContextType} Context menu controls and state
 * @throws {Error} When used outside of ContextMenuProvider
 */
export const useContextMenuProvider = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenuProvider must be used within a ContextMenuProvider');
  }
  return context;
};
