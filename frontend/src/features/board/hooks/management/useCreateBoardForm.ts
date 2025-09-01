import { useActionState } from 'react';

import { createBoard } from 'features/board/services/boardService';
import type { Board } from 'features/board/types/BoardTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { APP_CONFIG } from 'shared/constants/AppConstants';
import logger from 'shared/utils/logger';


interface CreateBoardState {
  success: boolean;
  error?: string;
  data?: Board;
}

export const useCreateBoardForm = (onBoardCreated: (newBoard: Board) => void) => {
  const { t } = useTranslation(['board', 'common']);

  const createBoardAction = async (_previousState: CreateBoardState, formData: FormData): Promise<CreateBoardState> => {
    const name = (formData.get('name') as string)?.trim() ?? '';
    const description = (formData.get('description') as string)?.trim() ?? '';
    const picture = formData.get('picture') as File;
    const inviteEmails = formData.getAll('inviteEmails') as string[];
    const canvasBackgroundColor = formData.get('canvasBackgroundColor') as string;
    const canvasWidth = formData.get('canvasWidth') as string;
    const canvasHeight = formData.get('canvasHeight') as string;

    if (!name) {
      toast.error(t('board:createForm.validation.nameRequired'));
      return {
        success: false,
      };
    }

    if (name.length < APP_CONFIG.MIN_BOARD_NAME_LENGTH) {
      logger.warn('[useCreateBoardForm] Board name validation failed - too short');
      toast.error(t('board:createForm.nameLengthError'));
      return {
        success: false,
      };
    }

    const submitFormData = new FormData();
    submitFormData.append('name', name);
    submitFormData.append('description', description);

    if (picture && picture.size > 0) {
      submitFormData.append('picture', picture);
    }

    inviteEmails.forEach((email) => {
      if (email.trim()) {
        submitFormData.append('inviteEmails', email.trim());
      }
    });

    if (canvasBackgroundColor) {
      submitFormData.append('canvasBackgroundColor', canvasBackgroundColor);
    }
    if (canvasWidth) {
      submitFormData.append('canvasWidth', canvasWidth);
    }
    if (canvasHeight) {
      submitFormData.append('canvasHeight', canvasHeight);
    }

    try {
      toast.loading(t('board:loading.create'));
      const newBoard = await createBoard(submitFormData);
      toast.dismiss();
      toast.success(t('board:success.create', { boardName: newBoard.name }));
      onBoardCreated(newBoard);

      return {
        success: true,
        data: newBoard,
      };
    } catch (err: unknown) {
      toast.dismiss();
      // Don't show generic error - specific validation errors are already shown by apiClient
      logger.error('[useCreateBoardForm] Failed to create board:', err);
      return {
        success: false,
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
