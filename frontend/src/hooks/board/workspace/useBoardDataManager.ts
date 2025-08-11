import { useCallback, useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import logger from 'utils/Logger';

import * as boardService from 'services/BoardService';
import type { ActionPayload } from 'types/BoardObjectTypes';
import type { ChatMessageResponse } from 'types/MessageTypes';


export const useBoardDataManager = (boardId: number) => {
    const [isLoading, setIsLoading] = useState(true);
    const [boardName, setBoardName] = useState<string | null>(null);
    const [accessLost, setAccessLost] = useState(false);
    const [objects, setObjects] = useState<ActionPayload[]>([]);
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);

    const fetchInitialData = useCallback(() => {
        setIsLoading(true);
        Promise.all([
            boardService.getBoardDetails(boardId),
            boardService.getBoardObjects(boardId),
            boardService.getBoardMessages(boardId),
        ])
            .then(([details, objectActions, messageHistory]) => {
                setBoardName(details.name);
                const initialObjects = objectActions
                    .filter((a) => a.payload)
                    .map((a) => ({ ...(a.payload as object), instanceId: a.instanceId }) as ActionPayload);
                setObjects(initialObjects);
                setMessages(messageHistory);
            })
            .catch((error) => {
                logger.error('Failed to fetch initial board data:', error);
                if (error instanceof AxiosError && error.response?.status === 403) {
                    setAccessLost(true);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [boardId]);

    useEffect(() => {
        if (isNaN(boardId) || boardId === 0) {
            setAccessLost(true);
            return;
        }
        fetchInitialData();
    }, [boardId, fetchInitialData]);

    return {
        isLoading,
        boardName,
        accessLost,
        objects,
        messages,
        setBoardName,
        setAccessLost,
        setObjects,
        setMessages,
        fetchInitialData,
    };
};
