
import { AxiosError } from 'axios';
import * as boardService from 'features/board/services/boardService';
import type { ActionPayload } from 'features/board/types/BoardObjectTypes';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';

export const useBoardDataManager = (boardId: number) => {
  const { t } = useTranslation(['board', 'common']);
  const [isLoading, setIsLoading] = useState(true);
  const [boardName, setBoardName] = useState<string | null>(null);
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [accessLost, setAccessLost] = useState(false);
  const [objects, setObjects] = useState<ActionPayload[]>([]);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);

  const fetchInitialData = useCallback(() => {
    setIsLoading(true);

    const startTime = Date.now();
    const minDelay = 200;

    Promise.all([
      boardService.getBoardDetails(boardId),
      boardService.getBoardObjects(boardId),
      boardService.getBoardMessages(boardId),
    ])
      .then(([details, objectActions, messageHistory]) => {
        setBoardName(details.name);
        setBoardDetails(details);
        const initialObjects = objectActions
          .filter((a) => a.payload)
          .map((a) => ({ ...a.payload, instanceId: a.instanceId }) as ActionPayload);
        setObjects(initialObjects);
        setMessages(messageHistory);
      })
      .catch((error) => {
        logger.error('Failed to fetch initial board data:', error);
        if (error instanceof AxiosError && error.response?.status === 403) {
          setAccessLost(true);
        } else {
          toast.error(t('board:errors.workspace'));
        }
      })
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingDelay);
      });
  }, [boardId, t]);

  useEffect(() => {
    if (isNaN(boardId) ?? boardId === 0) {
      setAccessLost(true);
      return;
    }
    fetchInitialData();
  }, [boardId, fetchInitialData]);

  return {
    isLoading,
    boardName,
    boardDetails,
    accessLost,
    objects,
    messages,
    setBoardName,
    setBoardDetails,
    setAccessLost,
    setObjects,
    setMessages,
    fetchInitialData,
  };
};
