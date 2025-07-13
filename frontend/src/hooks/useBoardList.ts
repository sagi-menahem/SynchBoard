// File: frontend/src/hooks/useBoardList.ts

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getBoards } from '../services/boardService';
import type { Board } from '../types/board.types';

/**
 * This custom hook encapsulates all the logic for the BoardListPage.
 * It handles data fetching, loading and error states, and modal visibility.
 */
export const useBoardList = () => {
    const { t } = useTranslation();
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchBoards = useCallback(async () => {
        try {
            setIsLoading(true);
            const userBoards = await getBoards();
            setBoards(userBoards);
        } catch (err) {
            setError(t('boardListPage.fetchError'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    const handleBoardCreated = (newBoard: Board) => {
        setBoards(prevBoards => [...prevBoards, newBoard]);
        setIsModalOpen(false);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // The hook returns everything the component needs to render the UI.
    return {
        boards,
        isLoading,
        error,
        isModalOpen,
        handleBoardCreated,
        openModal,
        closeModal,
    };
};