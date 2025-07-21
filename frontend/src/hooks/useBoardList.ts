// File: frontend/src/hooks/useBoardList.ts
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { getBoards, leaveBoard } from '../services/boardService';
import type { Board } from '../types/board.types';
import { useContextMenu } from './useContextMenu';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import { WEBSOCKET_TOPICS } from '../constants/api.constants';
import type { UserUpdateDTO } from '../types/websocket.types';

export const useBoardList = () => {
    const { t } = useTranslation();
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const contextMenu = useContextMenu<Board>();
    const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [boardToLeave, setBoardToLeave] = useState<Board | null>(null);
    const { userEmail } = useAuth();

    const fetchBoards = useCallback(async () => {
        if (!boards.length) {
            setIsLoading(true);
        }
        try {
            const userBoards = await getBoards();
            setBoards(userBoards);
        } catch (err) {
            toast.error(t('boardListPage.fetchError'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [t, boards.length]);

    useEffect(() => {
        fetchBoards();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBoardCreated = (newBoard: Board) => {
        setBoards(prevBoards => [...prevBoards, newBoard]);
        setIsModalOpen(false);
    };

    const handleConfirmLeave = useCallback(async () => {
        console.log(`[handleConfirmLeave] Triggered. boardToLeave:`, boardToLeave);

        if (!boardToLeave) {
            console.error("[handleConfirmLeave] Error: boardToLeave is null. Aborting.");
            return;
        }

        try {
            await leaveBoard(boardToLeave.id);
            toast.success(t('leaveBoard.success'));
            fetchBoards();
        } catch (error) {
            console.error("Failed to leave board:", error);
            const errorMessage = error instanceof AxiosError && error.response?.data?.message
                ? error.response.data.message
                : t('leaveBoard.error');
            toast.error(errorMessage);
        } finally {
            console.log("[handleConfirmLeave] Cleaning up state.");
            setLeaveConfirmOpen(false);
            setBoardToLeave(null);
        }
    }, [boardToLeave, t, fetchBoards]);

    const handleLeaveClick = () => {
        console.log(`[handleLeaveClick] Triggered. contextMenu.data:`, contextMenu.data);

        if (!contextMenu.data) {
            console.error("[handleLeaveClick] Error: contextMenu.data is null. Aborting.");
            return;
        }
        setBoardToLeave(contextMenu.data);
        setLeaveConfirmOpen(true);
        contextMenu.closeMenu();
        console.log(`[handleLeaveClick] State updated. boardToLeave set to: ${contextMenu.data.name}, isLeaveConfirmOpen set to: true`);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleUserUpdate = useCallback((message: UserUpdateDTO) => {
        console.log(`[useBoardList] Received user update of type: ${message.updateType}. Refetching board list.`);
        fetchBoards();
    }, [fetchBoards]);

    useSocket(userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '', handleUserUpdate);

    return {
        boards,
        isLoading,
        isModalOpen,
        contextMenu,
        isLeaveConfirmOpen,
        setLeaveConfirmOpen,
        boardToLeave,
        handleBoardCreated,
        openModal,
        closeModal,
        handleConfirmLeave,
        handleLeaveClick,
    };
};