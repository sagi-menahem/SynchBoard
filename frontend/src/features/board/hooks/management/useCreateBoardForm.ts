import { createBoard } from 'features/board/services/boardService';
import type { Board } from 'features/board/types/BoardTypes';
import { useCallback, useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { APP_CONFIG } from 'shared/constants/AppConstants';
import logger from 'shared/utils/logger';

interface CreateBoardState {
  success: boolean;
  error?: string;
  data?: Board;
}

/**
 * Custom hook that manages board creation form state and submission logic.
 * This hook provides a complete form management solution for creating new boards including
 * form validation, file uploads, member invitations, and canvas settings. It utilizes React's
 * useState and useTransition for form state management and provides comprehensive error handling with
 * toast notifications. The hook handles complex form data including board details, picture uploads,
 * member email invitations, and canvas configuration settings, ensuring all data is properly
 * validated and formatted before submission to the backend API.
 *
 * @param onBoardCreated - Callback function invoked when a board is successfully created
 * @returns Object containing form state, submission action, and pending state for UI feedback
 */
export const useCreateBoardForm = (onBoardCreated: (newBoard: Board) => void) => {
  const { t } = useTranslation(['board', 'common']);
  const [state, setState] = useState<CreateBoardState>({ success: false });
  const [isPending, startTransition] = useTransition();

  const submitAction = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        const name = (formData.get('name') as string)?.trim() ?? '';
        const description = (formData.get('description') as string)?.trim() ?? '';
        const picture = formData.get('picture') as File;
        const inviteEmails = formData.getAll('inviteEmails') as string[];
        const canvasBackgroundColor = formData.get('canvasBackgroundColor') as string;
        const canvasWidth = formData.get('canvasWidth') as string;
        const canvasHeight = formData.get('canvasHeight') as string;

        if (!name) {
          toast.error(t('board:createForm.validation.nameRequired'));
          setState({ success: false });
          return;
        }

        if (name.length < APP_CONFIG.MIN_BOARD_NAME_LENGTH) {
          logger.warn('[useCreateBoardForm] Board name validation failed - too short');
          toast.error(t('board:createForm.nameLengthError'));
          setState({ success: false });
          return;
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

          setState({
            success: true,
            data: newBoard,
          });
        } catch (err: unknown) {
          toast.dismiss();
          logger.error('[useCreateBoardForm] Failed to create board:', err);
          setState({ success: false });
        }
      });
    },
    [t, onBoardCreated],
  );

  return {
    state,
    submitAction,
    isPending,
  };
};
