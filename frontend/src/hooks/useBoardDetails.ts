// File: frontend/src/hooks/useBoardDetails.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getBoardDetails } from '../services/boardService';
import type { BoardDetails } from '../types/board.types';
import { useSocket } from './useSocket';
import { WEBSOCKET_TOPICS } from '../constants/api.constants';
import type { BoardUpdateDTO } from '../types/websocket.types';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../constants/routes.constants';
import { AxiosError } from 'axios';

export const useBoardDetails = (boardId: number | undefined) => {
    const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { userEmail } = useAuth();
    const navigate = useNavigate();

    const fetchDetails = useCallback(async () => {
        if (!boardId || isNaN(boardId)) {
            setIsLoading(false);
            return;
        }

        try {
            if (!boardDetails) {
                setIsLoading(true);
            }
            const data = await getBoardDetails(boardId);
            setBoardDetails(data);
        } catch (error) {
            console.error("Failed to fetch board details:", error);

            if (error instanceof AxiosError && error.response?.status === 403) {
                toast.error("You have been removed from this board.");
                navigate(APP_ROUTES.BOARD_LIST);
            } else {
                toast.error("Could not load board details.");
            }
            setBoardDetails(null);
        } finally {
            setIsLoading(false);
        }
    }, [boardId, boardDetails, navigate]);

    useEffect(() => {
        fetchDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardId]);

    const handleBoardUpdate = useCallback((message: BoardUpdateDTO) => {
        if (message.sourceUserEmail === userEmail) {
            return;
        }

        console.log(`[useBoardDetails] Received board update of type: ${message.updateType}. Refetching details.`);
        fetchDetails();

    }, [fetchDetails, userEmail]);

    useSocket(boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', handleBoardUpdate);

    return { boardDetails, isLoading, refetch: fetchDetails };
};