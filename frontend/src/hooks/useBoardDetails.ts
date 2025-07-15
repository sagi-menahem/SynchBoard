// File: frontend/src/hooks/useBoardDetails.ts
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getBoardDetails } from '../services/boardService';
import type { BoardDetails } from '../types/board.types';

export const useBoardDetails = (boardId: number | undefined) => {
    const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!boardId || isNaN(boardId)) {
            setIsLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const data = await getBoardDetails(boardId);
                setBoardDetails(data);
            } catch (error) {
                console.error("Failed to fetch board details:", error);
                toast.error("Could not load board details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [boardId]);

    return { boardDetails, isLoading };
};