import { AxiosError } from 'axios';
import { useAuth } from 'features/auth/hooks/useAuth';
import * as boardService from 'features/board/services/boardService';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { BoardUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import { useCallback, useEffect, useOptimistic, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES, WEBSOCKET_TOPICS } from 'shared/constants';
import logger from 'shared/utils/logger';

interface BoardEditState {
  name?: string;
  description?: string;
}

interface BoardPermissions {
  currentUserIsAdmin: boolean;
  userEmail: string | null;
}

export interface UseBoardDetailsDataReturn {
  boardDetails: BoardDetails | null;
  isLoading: boolean;
  refetch: () => void;

  permissions: BoardPermissions;

  optimisticState: BoardEditState;
  handleUpdateName: (newName: string) => Promise<void>;
  handleUpdateDescription: (newDescription: string) => Promise<void>;
}

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

      setOptimisticState({ name: newName });

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

      setOptimisticState({ description: newDescription });

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
