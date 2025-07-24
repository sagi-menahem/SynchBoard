// File: frontend/src/hooks/useBoardList.ts
import { useCallback, useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { WEBSOCKET_TOPICS } from 'constants/api.constants';
import { useContextMenu } from 'hooks/common/useContextMenu';
import { useAuth } from 'hooks/useAuth';
import { useSocket } from 'hooks/useSocket';
import { getBoards, leaveBoard } from 'services/boardService';
import type { Board } from 'types/board.types';
import type { UserUpdateDTO } from 'types/websocket.types';

export const useBoardList = () => {
    const { t } = useTranslation();
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const contextMenu = useContextMenu<Board>();
    const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [boardToLeave, setBoardToLeave] = useState<Board | null>(null);
    const { userEmail } = useAuth();

    const fetchBoards = useCallback(() => {
        if (!boards.length) {
            setIsLoading(true);
        }
        getBoards()
            .then((userBoards) => {
                setBoards(userBoards);
            })
            .catch((err) => console.error(err))
            .finally(() => setIsLoading(false));
    }, [boards.length]);

    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    const handleBoardCreated = (newBoard: Board) => {
        setBoards((prevBoards) => [...prevBoards, newBoard]);
        setIsModalOpen(false);
    };

    const handleConfirmLeave = useCallback(() => {
        if (!boardToLeave) {
            console.error('Cannot leave board, boardToLeave is null.');
            return;
        }

        leaveBoard(boardToLeave.id)
            .then(() => {
                toast.success(t('leaveBoard.success', { boardName: boardToLeave.name }));
                fetchBoards();
            })
            .catch((error) => console.error('Failed to leave board:', error))
            .finally(() => {
                setLeaveConfirmOpen(false);
                setBoardToLeave(null);
            });
    }, [boardToLeave, t, fetchBoards]);

    const handleLeaveClick = () => {
        if (!contextMenu.data) return;
        setBoardToLeave(contextMenu.data);
        setLeaveConfirmOpen(true);
        contextMenu.closeMenu();
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleUserUpdate = useCallback(
        (message: UserUpdateDTO) => {
            console.log(`[useBoardList] Received user update: ${message.updateType}. Refetching board list.`);
            fetchBoards();
        },
        [fetchBoards]
    );

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
