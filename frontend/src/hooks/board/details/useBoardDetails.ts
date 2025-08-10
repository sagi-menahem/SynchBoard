import { useCallback, useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

import { WEBSOCKET_TOPICS } from 'constants/api.constants';
import { APP_ROUTES } from 'constants/routes.constants';
import { useAuth } from 'hooks/auth/useAuth';
import { useSocket } from 'hooks/global/useSocket';
import { getBoardDetails } from 'services/boardService';
import type { BoardDetails } from 'types/board.types';
import type { BoardUpdateDTO } from 'types/websocket.types';


export const useBoardDetails = (boardId: number | undefined) => {
    const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { userEmail } = useAuth();
    const navigate = useNavigate();

    const fetchDetails = useCallback(() => {
        if (!boardId || isNaN(boardId)) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        getBoardDetails(boardId)
            .then((data) => {
                setBoardDetails(data);
            })
            .catch((error) => {
                logger.error('Failed to fetch board details:', error);
                if (error instanceof AxiosError && error.response?.status === 403) {
                    navigate(APP_ROUTES.BOARD_LIST);
                }
                setBoardDetails(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [boardId, navigate]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleBoardUpdate = useCallback(
        (message: BoardUpdateDTO) => {
            if (message.sourceUserEmail === userEmail) {
                return;
            }
            logger.debug(`[useBoardDetails] Received board update of type: ${message.updateType}. Refetching details.`);
            fetchDetails();
        },
        [fetchDetails, userEmail]
    );

    useSocket(boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', handleBoardUpdate, 'board');

    return { boardDetails, isLoading, refetch: fetchDetails };
};
