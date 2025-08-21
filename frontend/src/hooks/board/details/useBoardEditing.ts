import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as boardService from 'services/boardService';


export const useBoardEditing = (boardId: number) => {
  const { t } = useTranslation();

  const handleUpdateName = useCallback(
    async (newName: string) => {
      if (!boardId) return;
      try {
        await boardService.updateBoardName(boardId, newName);
        toast.success(t('success.board.nameUpdate'));
      } catch (error) {
        logger.error('Update name error:', error);
        throw error;
      }
    },
    [boardId, t],
  );

  const handleUpdateDescription = useCallback(
    async (newDescription: string) => {
      if (!boardId) return;
      try {
        await boardService.updateBoardDescription(boardId, newDescription);
        toast.success(t('success.board.descriptionUpdate'));
      } catch (error) {
        logger.error('Update description error:', error);
        throw error;
      }
    },
    [boardId, t],
  );

  return {
    handleUpdateName,
    handleUpdateDescription,
  };
};
