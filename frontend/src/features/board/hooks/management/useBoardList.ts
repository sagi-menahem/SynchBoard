import { useAuth } from 'features/auth/hooks';
import * as BoardService from 'features/board/services/boardService';
import type { Board } from 'features/board/types/BoardTypes';
import type { ViewMode } from 'features/board/types/ToolbarTypes';
import * as UserService from 'features/settings/services/userService';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { UserUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES, WEBSOCKET_TOPICS } from 'shared/constants';
import { useContextMenu } from 'shared/hooks';
import { ensureMinimumDelay } from 'shared/utils';
import logger from 'shared/utils/logger';

/**
 * Custom hook that manages the board list interface including fetching, filtering, and operations.
 * This hook provides comprehensive board list management functionality including real-time updates
 * via WebSocket subscriptions, search filtering, board creation handling, and board leaving operations.
 * It handles the complex state management for the board list page, including optimistic updates for
 * specific board changes and full refetches for broader updates. The hook integrates with the context
 * menu system for board actions and manages modal states for board creation and confirmation dialogs.
 *
 * @returns Object containing board list state, filtered boards, loading states, modal controls,
 *   search functionality, and handlers for board operations and real-time updates
 */
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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) {
      return boards;
    }

    return boards.filter((board) => board.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [boards, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const toggleViewMode = useCallback(() => {
    const newMode: ViewMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);

    // Persist preference to backend
    UserService.updateUserPreferences({ boardListViewMode: newMode }).catch((error) => {
      logger.error('Failed to save view mode preference:', error);
      // Silent failure - user can still use the feature, just won't persist
    });
  }, [viewMode]);

  // Memoized to prevent unnecessary API calls while maintaining loading state consistency
  const fetchBoards = useCallback(() => {
    if (!boards.length) {
      setIsLoading(true);
    }

    const startTime = Date.now();

    BoardService.getBoards()
      .then((userBoards: Board[]) => {
        setBoards(userBoards);
      })
      .catch((err: unknown) => {
        logger.error('Failed to fetch boards:', err);
        toast.error(t('board:errors.fetch'));
      })
      .finally(() => {
        ensureMinimumDelay(startTime, () => setIsLoading(false));
      });
  }, [boards.length, t]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // Load user's view mode preference from backend
  useEffect(() => {
    const loadViewPreference = async () => {
      try {
        const profile = await UserService.getUserProfile();
        if (profile.boardListViewMode) {
          setViewMode(profile.boardListViewMode as ViewMode);
        }
      } catch (error) {
        logger.warn('Failed to load view mode preference:', error);
      }
    };

    void loadViewPreference();
  }, []);

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
    if (!contextMenu.data) {
      return;
    }
    setBoardToLeave(contextMenu.data);
    setLeaveConfirmOpen(true);
    contextMenu.closeMenu();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const updateSpecificBoard = useCallback(
    async (boardId: number) => {
      try {
        const updatedBoard = await BoardService.getBoardDetails(boardId);
        setBoards((prevBoards) => {
          const updatedBoards = prevBoards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  canvasBackgroundColor: updatedBoard.canvasBackgroundColor,
                  canvasWidth: updatedBoard.canvasWidth,
                  canvasHeight: updatedBoard.canvasHeight,
                  lastModifiedDate: new Date().toISOString(),
                }
              : board,
          );

          return updatedBoards.sort(
            (a, b) =>
              new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime(),
          );
        });
      } catch (error) {
        logger.warn('Failed to update specific board, falling back to full refetch:', error);
        fetchBoards();
      }
    },
    [fetchBoards],
  );

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

  useSocketSubscription(
    userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '',
    handleUserUpdate,
    'user',
  );

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
    toggleViewMode,
  };
};
