import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/Logger';

import * as boardService from 'services/BoardService';


export const useBoardEditing = (boardId: number, onSuccess?: () => void) => {
    const { t } = useTranslation();

    const handleUpdateName = useCallback(
        async (newName: string) => {
            if (!boardId) return;
            try {
                await boardService.updateBoardName(boardId, newName);
                toast.success(t('success.board.nameUpdate'));
                onSuccess?.();
            } catch (error) {
                logger.error('Update name error:', error);
                throw error;
            }
        },
        [boardId, onSuccess, t]
    );

    const handleUpdateDescription = useCallback(
        async (newDescription: string) => {
            if (!boardId) return;
            try {
                await boardService.updateBoardDescription(boardId, newDescription);
                toast.success(t('success.board.descriptionUpdate'));
                onSuccess?.();
            } catch (error) {
                logger.error('Update description error:', error);
                throw error;
            }
        },
        [boardId, onSuccess, t]
    );

    return {
        handleUpdateName,
        handleUpdateDescription,
    };
};
