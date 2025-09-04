import { BoardContext } from 'features/board/BoardContext';
import { useContext } from 'react';

import logger from 'shared/utils/logger';

/**
 * Custom hook that provides access to the BoardContext with error handling.
 * This hook ensures the component is wrapped in a BoardProvider and provides
 * access to board-related state and actions throughout the component tree.
 * 
 * @returns Board context value containing board state and management functions
 * @throws {Error} When used outside of BoardProvider wrapper
 */
export const useBoardContext = () => {
  const context = useContext(BoardContext);

  if (context === undefined) {
    const error = new Error('useBoardContext must be used within a BoardProvider');
    logger.error('[useBoardContext] Context not found - missing BoardProvider wrapper');
    throw error;
  }

  return context;
};
