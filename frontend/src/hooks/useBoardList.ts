// File: frontend/src/hooks/useBoardList.ts

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getBoards } from '../services/boardService';
import type { Board } from '../types/board.types';

export const useBoardList = () => {
    const { t } = useTranslation();
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // const [error, setError] = useState<string | null>(null); // No longer needed
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchBoards = useCallback(async () => {
        try {
            setIsLoading(true);
            const userBoards = await getBoards();
            setBoards(userBoards);
        } catch (err) {
            toast.error(t('boardListPage.fetchError'));
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

    return {
        boards,
        isLoading,
        // error, // No longer returned
        isModalOpen,
        handleBoardCreated,
        openModal,
        closeModal,
    };
};