// File: frontend/src/hooks/board/details/useBoardEditing.ts
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as boardService from 'services/boardService';

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
                console.error('Update name error:', error);
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
                console.error('Update description error:', error);
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
