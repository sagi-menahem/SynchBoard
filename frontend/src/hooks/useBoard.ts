// File: frontend/src/hooks/useBoard.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import * as boardService from '../services/boardService';
import websocketService from '../services/websocketService';
import { useSocket } from './useSocket';
import type { BoardActionResponse, SendBoardActionRequest } from '../types/boardObject.types';
import type { ChatMessageResponse } from '../types/message.types';
import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from '../constants/api.constants';

/**
 * This hook is responsible for synchronizing the board state (drawing objects and chat messages)
 * with the backend via WebSocket and initial data fetching.
 */
export const useBoardSync = (boardId: number) => {
    const instanceId = useRef(Math.random().toString(36).substring(2));

    const [initialObjects, setInitialObjects] = useState<BoardActionResponse[]>([]);
    const [lastReceivedAction, setLastReceivedAction] = useState<BoardActionResponse | null>(null);
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isNaN(boardId)) return;

        boardService.getBoardObjects(boardId)
            .then(objects => setInitialObjects(objects))
            .catch(error => console.error("Failed to fetch initial board state:", error))
            .finally(() => setIsLoading(false));
    }, [boardId]);

    const onMessageReceived = useCallback((payload: unknown) => {
        if (typeof payload !== 'object' || !payload) return;

        if ('payload' in payload && 'sender' in payload && 'instanceId' in payload) {
            setLastReceivedAction(payload as BoardActionResponse);
        } else if ('content' in payload && 'sender' in payload && 'timestamp' in payload) {
            setMessages(prev => [...prev, payload as ChatMessageResponse]);
        }
    }, []);

    useSocket(WEBSOCKET_TOPICS.BOARD(boardId), onMessageReceived);

    const handleDrawAction = useCallback((action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => {
        const actionToSend: SendBoardActionRequest = {
            ...action,
            boardId,
            instanceId: instanceId.current,
        };
        websocketService.sendMessage(WEBSOCKET_DESTINATIONS.DRAW_ACTION, actionToSend);
    }, [boardId]);

    return {
        isLoading,
        initialObjects,
        lastReceivedAction,
        messages,
        instanceId: instanceId.current,
        handleDrawAction,
    };
};
