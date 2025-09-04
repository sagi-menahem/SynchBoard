import { useContext } from 'react';

import { BoardContext } from 'features/board/BoardContext';
import logger from 'shared/utils/logger';

export const useBoardContext = () => {
  const context = useContext(BoardContext);

  if (context === undefined) {
    const error = new Error('useBoardContext must be used within a BoardProvider');
    logger.error('[useBoardContext] Context not found - missing BoardProvider wrapper');
    throw error;
  }

  return context;
};
