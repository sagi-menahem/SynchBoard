import React, { type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { BoardContext } from './BoardContext';
import { useBoardWorkspace } from './hooks/workspace';

interface BoardProviderProps {
  boardId: number;
  children: ReactNode;
}

/**
 * Board context provider managing collaborative whiteboard state and real-time synchronization.
 * Provides comprehensive board functionality to child components including canvas management,
 * drawing tools, member collaboration, WebSocket communication, and board settings. The provider
 * centralizes all board-related state and operations, enabling seamless collaborative drawing
 * experiences across multiple users with real-time updates and conflict resolution.
 * 
 * The value object provides:
 * - Canvas state and drawing operations
 * - Active tool management and settings
 * - Real-time member presence and collaboration
 * - WebSocket connection and message handling
 * - Board metadata and configuration
 * - Drawing history and undo/redo functionality
 * - Object selection and manipulation tools
 * 
 * @param boardId - Unique identifier of the board to manage and provide context for
 * @param children - Child components that will have access to the board context
 */
export const BoardProvider: React.FC<BoardProviderProps> = ({ boardId, children }) => {
  const { t } = useTranslation(['board', 'common']);

  const boardData = useBoardWorkspace(boardId);

  if (isNaN(boardId) || boardId <= 0) { // Validate board ID exists and is a positive integer to prevent invalid board access
    return <div>{t('board:provider.invalidIdError')}</div>;
  }

  return <BoardContext.Provider value={boardData}>{children}</BoardContext.Provider>;
};
