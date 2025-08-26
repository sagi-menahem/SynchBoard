import { APP_ROUTES, WEBSOCKET_TOPICS } from 'constants';

import { useCallback, useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { BoardService } from 'services';
import type { BoardDetails, BoardUpdateDTO } from 'types';
import { Logger } from 'utils';

import { useSocketSubscription } from 'hooks/common';


const logger = Logger;


export const useBoardDetails = (boardId: number | undefined) => {
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
    const minDelay = 250; // 300ms minimum delay

    BoardService.getBoardDetails(boardId)
      .then((data: unknown) => {
        setBoardDetails(data as BoardDetails);
      })
      .catch((error: unknown) => {
        logger.error('Failed to fetch board details:', error);
        if (error instanceof AxiosError && error.response?.status === 403) {
          navigate(APP_ROUTES.BOARD_LIST);
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
  }, [boardId, navigate]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleBoardUpdate = useCallback(
    (message: BoardUpdateDTO) => {
      logger.debug(`[useBoardDetails] Received board update of type: ${message.updateType}. Refetching details.`);
            
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
