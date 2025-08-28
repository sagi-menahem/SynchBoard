import { useActionState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import { APP_CONFIG } from 'constants/AppConstants';
import { createBoard } from 'services/boardService';
import type { Board } from 'types/BoardTypes';

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
    const picture = formData.get('picture') as File;
    const inviteEmails = formData.getAll('inviteEmails') as string[];
    const canvasBackgroundColor = formData.get('canvasBackgroundColor') as string;
    const canvasWidth = formData.get('canvasWidth') as string;
    const canvasHeight = formData.get('canvasHeight') as string;

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
      const newBoard = await toast.promise(
        createBoard(submitFormData),
        {
          loading: t('loading.board.create'),
          success: (board) => t('success.board.create', { boardName: board.name }),
          error: t('errors.board.create'),
        },
      );
      onBoardCreated(newBoard);
      
      return {
        success: true,
        data: newBoard,
      };
    } catch (err: unknown) {
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
