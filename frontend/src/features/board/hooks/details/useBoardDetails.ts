
import { useCallback, useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import * as boardService from 'features/board/services/boardService';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { BoardUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES, WEBSOCKET_TOPICS } from 'shared/constants';
import logger from 'shared/utils/logger';


// Logger is now imported directly

export const useBoardDetails = (boardId: number | undefined) => {
  const { t } = useTranslation(['board', 'common']);
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchDetails = useCallback(() => {
    if (!boardId || isNaN(boardId)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const startTime = Date.now();
    const minDelay = 200;

    boardService.getBoardDetails(boardId)
      .then((data: unknown) => {
        setBoardDetails(data as BoardDetails);
      })
      .catch((error: unknown) => {
        logger.error('Failed to fetch board details:', error);
        if (error instanceof AxiosError && error.response?.status === 403) {
          navigate(APP_ROUTES.BOARD_LIST);
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

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleBoardUpdate = useCallback(
    (message: BoardUpdateDTO) => {
      if (!boardId || isNaN(boardId)) {
        return;
      }

      boardService.getBoardDetails(boardId)
        .then((data: unknown) => {
          setBoardDetails(data as BoardDetails);
        })
        .catch((error: unknown) => {
          logger.error('Failed to refetch board details after WebSocket update:', error);
          if (message.updateType === 'MEMBERS_UPDATED' && 
                        error instanceof AxiosError && error.response?.status === 403) {
            navigate(APP_ROUTES.BOARD_LIST);
          }
        });
    },
    [boardId, navigate],
  );

  useSocketSubscription(boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', handleBoardUpdate, 'board');

  return { boardDetails, isLoading, refetch: fetchDetails };
};
