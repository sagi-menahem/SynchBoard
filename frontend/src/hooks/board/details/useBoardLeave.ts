import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

import { APP_ROUTES } from 'constants/RoutesConstants';
import * as boardService from 'services/BoardService';
import type { BoardDetails } from 'types/BoardTypes';


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
                logger.error('Failed to leave board:', error);
                throw error;
            }
        },
        [boardId, navigate, t]
    );

    return {
        handleLeaveBoard,
    };
};
