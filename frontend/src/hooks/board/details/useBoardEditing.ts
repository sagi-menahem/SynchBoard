import { useCallback, useOptimistic, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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

      setOptimisticState({ name: newName });

      try {
        await toast.promise(
          boardService.updateBoardName(boardId, newName),
          {
            loading: t('loading.board.nameUpdate'),
            success: t('success.board.nameUpdate'),
            error: t('errors.board.nameUpdate'),
          },
        );
      } catch (error) {
        throw error;
      }
    },
    [boardId, t, setOptimisticState],
  );

  const handleUpdateDescription = useCallback(
    async (newDescription: string) => {
      if (!boardId) return;

      setOptimisticState({ description: newDescription });

      try {
        await toast.promise(
          boardService.updateBoardDescription(boardId, newDescription),
          {
            loading: t('loading.board.descriptionUpdate'),
            success: t('success.board.descriptionUpdate'),
            error: t('errors.board.descriptionUpdate'),
          },
        );
      } catch (error) {
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
