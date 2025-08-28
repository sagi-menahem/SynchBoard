import { APP_ROUTES, WEBSOCKET_TOPICS } from 'constants';

import { useCallback, useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BoardService } from 'services';
import type { BoardDetails, BoardUpdateDTO } from 'types';
import { Logger } from 'utils';

import { useSocketSubscription } from 'hooks/common/useSocket';

const logger = Logger;

export const useBoardDetails = (boardId: number | undefined) => {
  const { t } = useTranslation();
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

    BoardService.getBoardDetails(boardId)
      .then((data: unknown) => {
        setBoardDetails(data as BoardDetails);
      })
      .catch((error: unknown) => {
        logger.error('Failed to fetch board details:', error);
        if (error instanceof AxiosError && error.response?.status === 403) {
          navigate(APP_ROUTES.BOARD_LIST);
        } else {
          toast.error(t('errors.board.details'));
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

      BoardService.getBoardDetails(boardId)
        .then((data: unknown) => {
          setBoardDetails(data as BoardDetails);
        })
        .catch((error: unknown) => {
          logger.warn('Failed to refetch board details after WebSocket update:', error);
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
