
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from 'features/auth/hooks';
import * as BoardService from 'features/board/services/boardService';
import type { Board } from 'features/board/types/BoardTypes';
import type { ViewMode } from 'features/board/types/ToolbarTypes';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { UserUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES, WEBSOCKET_TOPICS } from 'shared/constants';
import { useContextMenu } from 'shared/hooks';
import logger from 'shared/utils/logger';


export const useBoardList = () => {
  const { t } = useTranslation(['board', 'common']);
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const contextMenu = useContextMenu<Board>();
  const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [boardToLeave, setBoardToLeave] = useState<Board | null>(null);
  const { userEmail } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const viewMode: ViewMode = 'list';
  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) {
      return boards;
    }

    return boards.filter((board) =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [boards, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const fetchBoards = useCallback(() => {
    if (!boards.length) {
      setIsLoading(true);
    }

    const startTime = Date.now();
    const minDelay = 200;

    BoardService.getBoards()
      .then((userBoards: Board[]) => {
        setBoards(userBoards);
      })
      .catch((err: unknown) => {
        logger.error('Failed to fetch boards:', err);
        toast.error(t('board:errors.fetch'));
      })
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingDelay);
      });
  }, [boards.length, t]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleBoardCreated = (newBoard: Board) => {
    setBoards((prevBoards) => [...prevBoards, newBoard]);
    setIsModalOpen(false);
    void navigate(APP_ROUTES.getBoardDetailRoute(newBoard.id));
  };

  const handleConfirmLeave = useCallback(() => {
    if (!boardToLeave) {
      logger.error('Cannot leave board, boardToLeave is null.');
      return;
    }

    void BoardService.leaveBoard(boardToLeave.id)
      .then(() => {
        toast.success(t('board:success.leave', { boardName: boardToLeave.name }));
        fetchBoards();
      })
      .catch((error: unknown) => {
        logger.error('Failed to leave board:', error);
        toast.error(t('board:errors.leave'));
      })
      .finally(() => {
        setLeaveConfirmOpen(false);
        setBoardToLeave(null);
      });
  }, [boardToLeave, t, fetchBoards]);

  const handleLeaveClick = () => {
    if (!contextMenu.data) {return;}
    setBoardToLeave(contextMenu.data);
    setLeaveConfirmOpen(true);
    contextMenu.closeMenu();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const updateSpecificBoard = useCallback(async (boardId: number) => {
    try {
      const updatedBoard = await BoardService.getBoardDetails(boardId);
      setBoards((prevBoards) => {
        const updatedBoards = prevBoards.map((board) =>
          board.id === boardId ? {
            ...board,
            canvasBackgroundColor: updatedBoard.canvasBackgroundColor,
            canvasWidth: updatedBoard.canvasWidth,
            canvasHeight: updatedBoard.canvasHeight,
            lastModifiedDate: new Date().toISOString(),
          } : board,
        );

        return updatedBoards.sort((a, b) =>
          new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime(),
        );
      });
    } catch (error) {
      logger.warn('Failed to update specific board, falling back to full refetch:', error);
      fetchBoards();
    }
  }, [fetchBoards]);

  const handleUserUpdate = useCallback(
    (message: UserUpdateDTO) => {
      if (message.updateType === 'BOARD_DETAILS_CHANGED' && message.boardId) {
        void updateSpecificBoard(message.boardId);
      } else {
        fetchBoards();
      }
    },
    [fetchBoards, updateSpecificBoard],
  );

  useSocketSubscription(userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '', handleUserUpdate, 'user');

  return {
    boards: filteredBoards,
    allBoards: boards,
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
    searchQuery,
    handleSearch,
    handleClearSearch,
    viewMode,
  };
};
