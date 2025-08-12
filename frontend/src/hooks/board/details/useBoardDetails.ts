import { WEBSOCKET_TOPICS, APP_ROUTES } from 'constants';

import { useCallback, useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { BoardService } from 'services';
import type { BoardDetails, BoardUpdateDTO } from 'types';
import { Logger } from 'utils';

import { useAuth } from 'hooks/auth';
import { useSocket } from 'hooks/common';


const logger = Logger;


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

        BoardService.getBoardDetails(boardId)
            .then((data: any) => {
                setBoardDetails(data);
            })
            .catch((error: any) => {
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
            
            if (!boardId || isNaN(boardId)) {
                return;
            }

            BoardService.getBoardDetails(boardId)
                .then((data: any) => {
                    setBoardDetails(data);
                })
                .catch((error: any) => {
                    logger.warn('Failed to refetch board details after WebSocket update:', error);
                    if (message.updateType === 'MEMBERS_UPDATED' && 
                        error instanceof AxiosError && error.response?.status === 403) {
                        navigate(APP_ROUTES.BOARD_LIST);
                    }
                });
        },
        [boardId, userEmail, navigate]
    );

    useSocket(boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', handleBoardUpdate, 'board');

    return { boardDetails, isLoading, refetch: fetchDetails };
};
