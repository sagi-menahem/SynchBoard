import { useContext } from 'react';

import logger from 'utils/Logger';

import { BoardContext } from 'context/BoardContext.ts';

export const useBoardContext = () => {
  const context = useContext(BoardContext);
    
  if (context === undefined) {
    const error = new Error('useBoardContext must be used within a BoardProvider');
    logger.error('[useBoardContext] Context not found - missing BoardProvider wrapper');
    throw error;
  }
    
  return context;
};
