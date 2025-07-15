// File: frontend/src/hooks/useBoardDetails.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getBoardDetails } from '../services/boardService';
import type { BoardDetails } from '../types/board.types';

export const useBoardDetails = (boardId: number | undefined) => {
    const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchDetails = useCallback(async () => {
        if (!boardId || isNaN(boardId)) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await getBoardDetails(boardId);
            setBoardDetails(data);
        } catch (error) {
            console.error("Failed to fetch board details:", error);
            toast.error("Could not load board details.");
            setBoardDetails(null);
        } finally {
            setIsLoading(false);
        }
    }, [boardId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    return { boardDetails, isLoading, refetch: fetchDetails };
};