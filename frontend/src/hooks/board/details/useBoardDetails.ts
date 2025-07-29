// File: frontend/src/hooks/board/details/useBoardDetails.ts
import { AxiosError } from 'axios';
import { WEBSOCKET_TOPICS } from 'constants/api.constants';
import { APP_ROUTES } from 'constants/routes.constants';
import { useAuth } from 'hooks/auth/useAuth';
import { useSocket } from 'hooks/global/useSocket';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

        if (!boardDetails) {
            setIsLoading(true);
        }

        getBoardDetails(boardId)
            .then((data) => {
                setBoardDetails(data);
            })
            .catch((error) => {
                console.error('Failed to fetch board details:', error);
                if (error instanceof AxiosError && error.response?.status === 403) {
                    navigate(APP_ROUTES.BOARD_LIST);
                }
                setBoardDetails(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [boardId, boardDetails, navigate]);

    useEffect(() => {
        fetchDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardId]);

    const handleBoardUpdate = useCallback(
        (message: BoardUpdateDTO) => {
            if (message.sourceUserEmail === userEmail) {
                return;
            }
            console.log(`[useBoardDetails] Received board update of type: ${message.updateType}. Refetching details.`);
            fetchDetails();
        },
        [fetchDetails, userEmail]
    );

    useSocket(boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', handleBoardUpdate);

    return { boardDetails, isLoading, refetch: fetchDetails };
};
