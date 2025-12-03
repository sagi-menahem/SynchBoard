import { AxiosError } from 'axios';
import { useAuth } from 'features/auth/hooks/useAuth';
import * as boardService from 'features/board/services/boardService';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { BoardUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import { startTransition, useCallback, useEffect, useOptimistic, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES, WEBSOCKET_TOPICS } from 'shared/constants';
import logger from 'shared/utils/logger';

/**
 * Local state interface for board edit operations.
 * Tracks optimistic updates for board name and description changes.
 */
interface BoardEditState {
  /** Optimistic board name during editing */
  name?: string;
  /** Optimistic board description during editing */
  description?: string;
}

/**
 * User permissions interface for board access control.
 * Determines what actions the current user can perform on the board.
 */
interface BoardPermissions {
  /** Whether the current user has admin privileges for this board */
  currentUserIsAdmin: boolean;
  /** Email of the current authenticated user */
  userEmail: string | null;
}

/**
 * Return type interface for useBoardDetailsData hook.
 * Defines the complete set of board details data and management functions.
 */
export interface UseBoardDetailsDataReturn {
  /** Current board details data or null if not loaded */
  boardDetails: BoardDetails | null;
  /** Whether board details are currently being loaded */
  isLoading: boolean;
  /** Function to manually refetch board details */
  refetch: () => void;

  /** User permissions for the current board */
  permissions: BoardPermissions;

  /** Optimistic state for board edits (name and description) */
  optimisticState: BoardEditState;
  /** Handler for updating board name with optimistic updates */
  handleUpdateName: (newName: string) => Promise<void>;
  /** Handler for updating board description with optimistic updates */
  handleUpdateDescription: (newDescription: string) => Promise<void>;
}

/**
 * Custom hook that manages board details data fetching, caching, and real-time updates.
 * This hook handles loading board details, managing user permissions, providing optimistic
 * updates for name/description edits, and subscribing to real-time board changes via WebSocket.
 *
 * @param boardId - ID of the board to fetch details for, undefined if no board selected
 * @returns Complete board details management interface with data, permissions, and update handlers
 */
export const useBoardDetailsData = (boardId: number | undefined): UseBoardDetailsDataReturn => {
  const { t } = useTranslation(['board', 'common']);
  const { userEmail } = useAuth();
  const navigate = useNavigate();

  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [baseState, setBaseState] = useState<BoardEditState>({});
  const [optimisticState, setOptimisticState] = useOptimistic(
    baseState,
    (state, update: Partial<BoardEditState>) => ({ ...state, ...update }),
  );

  useEffect(() => {
    if (boardDetails) {
      const newBaseState = {
        name: boardDetails.name,
        description: boardDetails.description ?? undefined,
      };
      setBaseState(newBaseState);
    }
  }, [boardDetails]);

  const permissions: BoardPermissions = {
    currentUserIsAdmin:
      boardDetails?.members.find((member) => member.email === userEmail)?.isAdmin ?? false,
    userEmail,
  };

  const fetchDetails = useCallback(() => {
    if (!boardId || isNaN(boardId)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const startTime = Date.now();
    const minDelay = 200;

    void boardService
      .getBoardDetails(boardId)
      .then((data: unknown) => {
        setBoardDetails(data as BoardDetails);
      })
      .catch((error: unknown) => {
        logger.error('Failed to fetch board details:', error);
        if (error instanceof AxiosError && error.response?.status === 403) {
          void navigate(APP_ROUTES.BOARD_LIST);
        } else {
          toast.error(t('board:errors.details'));
        }
        setBoardDetails(null);
      })
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingDelay);
      });
  }, [boardId, navigate, t]);

  const handleBoardUpdate = useCallback(
    (message: BoardUpdateDTO) => {
      if (!boardId || isNaN(boardId)) {
        return;
      }

      void boardService
        .getBoardDetails(boardId)
        .then((data: unknown) => {
          setBoardDetails(data as BoardDetails);
        })
        .catch((error: unknown) => {
          logger.error('Failed to refetch board details after WebSocket update:', error);
          if (
            message.updateType === 'MEMBERS_UPDATED' &&
            error instanceof AxiosError &&
            error.response?.status === 403
          ) {
            void navigate(APP_ROUTES.BOARD_LIST);
          }
        });
    },
    [boardId, navigate],
  );

  const handleUpdateName = useCallback(
    async (newName: string) => {
      if (!boardId) {
        return;
      }

      startTransition(() => {
        setOptimisticState({ name: newName });
      });

      try {
        toast.loading(t('board:loading.nameUpdate'));
        await boardService.updateBoardName(boardId, newName);
        toast.dismiss();
        toast.success(t('board:success.nameUpdate'));
      } catch (error) {
        toast.dismiss();
        throw error;
      }
    },
    [boardId, t, setOptimisticState],
  );

  const handleUpdateDescription = useCallback(
    async (newDescription: string) => {
      if (!boardId) {
        return;
      }

      startTransition(() => {
        setOptimisticState({ description: newDescription });
      });

      try {
        toast.loading(t('board:loading.descriptionUpdate'));
        await boardService.updateBoardDescription(boardId, newDescription);
        toast.dismiss();
        toast.success(t('board:success.descriptionUpdate'));
      } catch (error) {
        toast.dismiss();
        throw error;
      }
    },
    [boardId, t, setOptimisticState],
  );

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useSocketSubscription(boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', handleBoardUpdate, 'board');

  return {
    boardDetails,
    isLoading,
    refetch: fetchDetails,
    permissions,
    optimisticState,
    handleUpdateName,
    handleUpdateDescription,
  };
};
