import { APP_ROUTES, WEBSOCKET_TOPICS } from 'constants';

import { useCallback, useEffect, useMemo, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BoardService } from 'services';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import { useContextMenu } from 'hooks/common';
import { useSocketSubscription } from 'hooks/common/useSocket';
import type { Board } from 'types/BoardTypes';
import type { ViewMode } from 'types/ToolbarTypes';
import type { UserUpdateDTO } from 'types/WebSocketTypes';


export const useBoardList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const contextMenu = useContextMenu<Board>();
  const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [boardToLeave, setBoardToLeave] = useState<Board | null>(null);
  const { userEmail } = useAuth();

  // New state for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const viewMode: ViewMode = 'list'; // Always use list view

  // Filter boards based on search query
  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) {
      return boards;
    }
    
    return boards.filter((board) =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [boards, searchQuery]);

  // Search functionality
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
    const minDelay = 250; // 300ms minimum delay
    
    BoardService.getBoards()
      .then((userBoards) => {
        setBoards(userBoards);
      })
      .catch((err) => logger.error(err))
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, minDelay - elapsed);
        
        setTimeout(() => {
          setIsLoading(false);
        }, remainingDelay);
      });
  }, [boards.length]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleBoardCreated = (newBoard: Board) => {
    setBoards((prevBoards) => [...prevBoards, newBoard]);
    setIsModalOpen(false);
    navigate(APP_ROUTES.getBoardDetailRoute(newBoard.id));
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
            lastModifiedDate: new Date().toISOString(), // Set to current time for immediate sorting
          } : board,
        );
        
        // Sort by lastModifiedDate DESC to maintain order
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
      logger.debug(`[useBoardList] Received user update: ${message.updateType}`);
      
      if (message.updateType === 'BOARD_DETAILS_CHANGED' && message.boardId) {
        logger.debug(`[useBoardList] Board ${message.boardId} details changed. Updating specific board.`);
        updateSpecificBoard(message.boardId);
      } else {
        logger.debug(`[useBoardList] ${message.updateType} received. Refetching board list.`);
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
    // Search functionality
    searchQuery,
    handleSearch,
    handleClearSearch,
    // View mode (always list)
    viewMode,
  };
};
