// File: frontend/src/hooks/board/details/useBoardPictureManager.ts
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as boardService from 'services/boardService';

export const useBoardPictureManager = (boardId: number, onSuccess?: () => void) => {
    const { t } = useTranslation();

    const handlePictureUpload = useCallback(
        async (file: File) => {
            try {
                await boardService.uploadBoardPicture(boardId, file);
                toast.success(t('success.board.pictureUpdate'));
                onSuccess?.();
            } catch (error) {
                console.error('Picture upload error:', error);
                throw error;
            }
        },
        [boardId, onSuccess, t]
    );

    const handlePictureDelete = useCallback(async () => {
        try {
            await boardService.deleteBoardPicture(boardId);
            toast.success(t('success.board.pictureDelete'));
            onSuccess?.();
        } catch (error) {
            console.error('Picture delete error:', error);
            throw error;
        }
    }, [boardId, onSuccess, t]);

    return {
        handlePictureUpload,
        handlePictureDelete,
    };
};
