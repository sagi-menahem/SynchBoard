// File: frontend/src/hooks/board/details/useBoardLeave.ts
import { APP_ROUTES } from 'constants/routes.constants';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as boardService from 'services/boardService';
import type { BoardDetails } from 'types/board.types';

export const useBoardLeave = (boardId: number) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleLeaveBoard = useCallback(
        async (boardDetails: BoardDetails | null) => {
            if (!boardDetails) return;
            try {
                await boardService.leaveBoard(boardId);
                toast.success(t('leaveBoard.success', { boardName: boardDetails.name }));
                navigate(APP_ROUTES.BOARD_LIST);
            } catch (error) {
                console.error('Failed to leave board:', error);
                throw error;
            }
        },
        [boardId, navigate, t]
    );

    return {
        handleLeaveBoard,
    };
};
