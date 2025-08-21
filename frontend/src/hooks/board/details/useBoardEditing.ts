import { useCallback, useOptimistic, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as boardService from 'services/boardService';

interface BoardEditState {
  name?: string;
  description?: string;
}

export const useBoardEditing = (boardId: number, initialName?: string, initialDescription?: string) => {
  const { t } = useTranslation();
  
  const [baseState] = useState<BoardEditState>({
    name: initialName,
    description: initialDescription,
  });

  const [optimisticState, setOptimisticState] = useOptimistic(
    baseState,
    (state, update: Partial<BoardEditState>) => ({ ...state, ...update }),
  );

  const handleUpdateName = useCallback(
    async (newName: string) => {
      if (!boardId) return;
      
      // Optimistic update
      setOptimisticState({ name: newName });
      
      try {
        await boardService.updateBoardName(boardId, newName);
        toast.success(t('success.board.nameUpdate'));
      } catch (error) {
        logger.error('Update name error:', error);
        // Optimistic update will automatically rollback on error
        throw error;
      }
    },
    [boardId, t, setOptimisticState],
  );

  const handleUpdateDescription = useCallback(
    async (newDescription: string) => {
      if (!boardId) return;
      
      // Optimistic update
      setOptimisticState({ description: newDescription });
      
      try {
        await boardService.updateBoardDescription(boardId, newDescription);
        toast.success(t('success.board.descriptionUpdate'));
      } catch (error) {
        logger.error('Update description error:', error);
        // Optimistic update will automatically rollback on error
        throw error;
      }
    },
    [boardId, t, setOptimisticState],
  );

  return {
    handleUpdateName,
    handleUpdateDescription,
    optimisticState,
  };
};
