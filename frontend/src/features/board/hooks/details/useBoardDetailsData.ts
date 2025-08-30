import { useCallback, useEffect, useOptimistic, useState } from 'react';

import { AxiosError } from 'axios';
import { useAuth } from 'features/auth/hooks/useAuth';
import * as boardService from 'features/board/services/boardService';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { BoardUpdateDTO } from 'features/websocket/types/WebSocketTypes';
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
  // Board data state
  boardDetails: BoardDetails | null;
  isLoading: boolean;
  refetch: () => void;
  
  // Permissions
  permissions: BoardPermissions;
  
  // Optimistic editing state
  optimisticState: BoardEditState;
  handleUpdateName: (newName: string) => Promise<void>;
  handleUpdateDescription: (newDescription: string) => Promise<void>;
}

export const useBoardDetailsData = (boardId: number | undefined): UseBoardDetailsDataReturn => {
  const { t } = useTranslation(['board', 'common']);
  const { userEmail } = useAuth();
  const navigate = useNavigate();
  
  // Board details state
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Optimistic editing state
  const [baseState, setBaseState] = useState<BoardEditState>({});
  const [optimisticState, setOptimisticState] = useOptimistic(
    baseState,
    (state, update: Partial<BoardEditState>) => ({ ...state, ...update }),
  );

  // Update base state when board details change
  useEffect(() => {
    if (boardDetails) {
      const newBaseState = {
        name: boardDetails.name,
        description: boardDetails.description ?? undefined,
      };
      setBaseState(newBaseState);
    }
  }, [boardDetails]);

  // Calculate permissions
  const permissions: BoardPermissions = {
    currentUserIsAdmin: boardDetails?.members.find((member) => member.email === userEmail)?.isAdmin ?? false,
    userEmail,
  };

  // Fetch board details
  const fetchDetails = useCallback(() => {
    if (!boardId || isNaN(boardId)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const startTime = Date.now();
    const minDelay = 200;

    void boardService.getBoardDetails(boardId)
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

  // WebSocket update handler
  const handleBoardUpdate = useCallback(
    (message: BoardUpdateDTO) => {
      if (!boardId || isNaN(boardId)) {
        return;
      }

      void boardService.getBoardDetails(boardId)
        .then((data: unknown) => {
          setBoardDetails(data as BoardDetails);
        })
        .catch((error: unknown) => {
          logger.error('Failed to refetch board details after WebSocket update:', error);
          if (message.updateType === 'MEMBERS_UPDATED' && 
                        error instanceof AxiosError && error.response?.status === 403) {
            void navigate(APP_ROUTES.BOARD_LIST);
          }
        });
    },
    [boardId, navigate],
  );

  // Board editing handlers
  const handleUpdateName = useCallback(
    async (newName: string) => {
      if (!boardId) {
        return;
      }

      setOptimisticState({ name: newName });

      try {
        await toast.promise(
          boardService.updateBoardName(boardId, newName),
          {
            loading: t('board:loading.nameUpdate'),
            success: t('board:success.nameUpdate'),
            error: t('board:errors.nameUpdate'),
          },
        );
      } catch (error) {
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
        await toast.promise(
          boardService.updateBoardDescription(boardId, newDescription),
          {
            loading: t('board:loading.descriptionUpdate'),
            success: t('board:success.descriptionUpdate'),
            error: t('board:errors.descriptionUpdate'),
          },
        );
      } catch (error) {
        throw error;
      }
    },
    [boardId, t, setOptimisticState],
  );

  // Load initial data
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Subscribe to WebSocket updates
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