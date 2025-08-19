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
        console.log(`[BOARD STATE ANALYSIS] fetchInitialData called - boardId: ${boardId}, about to fetch from server`);
        setIsLoading(true);
        Promise.all([
            boardService.getBoardDetails(boardId),
            boardService.getBoardObjects(boardId),
            boardService.getBoardMessages(boardId),
        ])
            .then(([details, objectActions, messageHistory]) => {
                console.log(`[BOARD STATE ANALYSIS] Server data fetched - objects: ${objectActions.length}, messages: ${messageHistory.length}`);
                setBoardName(details.name);
                const initialObjects = objectActions
                    .filter((a) => a.payload)
                    .map((a) => ({ ...(a.payload as object), instanceId: a.instanceId }) as ActionPayload);
                console.log(`[BOARD STATE ANALYSIS] Setting objects state to ${initialObjects.length} items - THIS WILL OVERWRITE LOCAL STATE INCLUDING QUEUED ITEMS`);
                setObjects(initialObjects);
                console.log(`[BOARD STATE ANALYSIS] Setting messages state to ${messageHistory.length} items - THIS WILL OVERWRITE LOCAL STATE INCLUDING QUEUED ITEMS`);
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
