import { useCallback, useOptimistic, useState } from 'react';

import * as boardService from 'features/board/services/boardService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';


interface BoardEditState {
  name?: string;
  description?: string;
}

export const useBoardEditing = (boardId: number, initialName?: string, initialDescription?: string) => {
  const { t } = useTranslation(['board', 'common']);

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
      if (!boardId) {return;}

      setOptimisticState({ name: newName });

      try {
        await toast.promise(
          boardService.updateBoardName(boardId, newName),
          {
            loading: t('board:loading.nameUpdate'),
            success: t('board:success.nameUpdate'),
            error: t('board:errors.nameUpdate'),
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
      if (!boardId) {return;}

      setOptimisticState({ description: newDescription });

      try {
        await toast.promise(
          boardService.updateBoardDescription(boardId, newDescription),
          {
            loading: t('board:loading.descriptionUpdate'),
            success: t('board:success.descriptionUpdate'),
            error: t('board:errors.descriptionUpdate'),
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
