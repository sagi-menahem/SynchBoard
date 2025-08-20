import { WEBSOCKET_TOPICS } from 'constants';

import { useCallback, useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { BoardService } from 'services';
import logger from 'utils/Logger';

import { useAuth } from 'hooks/auth';
import { useContextMenu, useSocketSubscription } from 'hooks/common';
import type { Board } from 'types/BoardTypes';
import type { UserUpdateDTO } from 'types/WebSocketTypes';


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
    BoardService.getBoards()
      .then((userBoards) => {
        setBoards(userBoards);
      })
      .catch((err) => logger.error(err))
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
      logger.error('Cannot leave board, boardToLeave is null.');
      return;
    }

    BoardService.leaveBoard(boardToLeave.id)
      .then(() => {
        toast.success(t('leaveBoard.success', { boardName: boardToLeave.name }));
        fetchBoards();
      })
      .catch((error) => logger.error('Failed to leave board:', error))
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
      logger.debug(`[useBoardList] Received user update: ${message.updateType}. Refetching board list.`);
      fetchBoards();
    },
    [fetchBoards],
  );

  useSocketSubscription(userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '', handleUserUpdate, 'user');

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
