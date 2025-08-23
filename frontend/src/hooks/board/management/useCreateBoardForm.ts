import { useActionState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import { APP_CONFIG } from 'constants/AppConstants';
import { createBoard } from 'services/boardService';
import type { Board, CreateBoardRequest } from 'types/BoardTypes';

interface CreateBoardState {
  success: boolean;
  error?: string;
  data?: Board;
}

export const useCreateBoardForm = (onBoardCreated: (newBoard: Board) => void) => {
  const { t } = useTranslation();

  const createBoardAction = async (_previousState: CreateBoardState, formData: FormData): Promise<CreateBoardState> => {
    const name = (formData.get('name') as string)?.trim() || '';
    const description = (formData.get('description') as string)?.trim() || '';

    // Validation
    if (!name) {
      return {
        success: false,
        error: t('createBoardForm.validation.nameRequired', 'Board name is required'),
      };
    }

    if (name.length < APP_CONFIG.MIN_BOARD_NAME_LENGTH) {
      logger.warn('[useCreateBoardForm] Board name validation failed - too short');
      return {
        success: false,
        error: t('createBoardForm.nameLengthError'),
      };
    }

    const boardData: CreateBoardRequest = { name, description };

    try {
      const newBoard = await createBoard(boardData);
      toast.success(t('createBoardSuccess', { boardName: newBoard.name }));
      onBoardCreated(newBoard);
      
      return {
        success: true,
        data: newBoard,
      };
    } catch (err: unknown) {
      logger.error('[useCreateBoardForm] Failed to create board:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : t('createBoardForm.error.unknown', 'Failed to create board'),
      };
    }
  };

  const [state, submitAction, isPending] = useActionState(createBoardAction, {
    success: false,
  });

  return {
    state,
    submitAction,
    isPending,
  };
};
