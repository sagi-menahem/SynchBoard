// File: frontend/src/hooks/board/workspace/useBoardSync.ts
import { WEBSOCKET_DESTINATIONS } from 'constants/api.constants';
import { APP_ROUTES } from 'constants/routes.constants';
import { useBoardActions } from 'hooks/board/workspace/useBoardActions';
import { useBoardDataManager } from 'hooks/board/workspace/useBoardDataManager';
import { useBoardWebSocketHandler } from 'hooks/board/workspace/useBoardWebSocketHandler';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import websocketService from 'services/websocketService';
import type { ActionPayload, SendBoardActionRequest } from 'types/boardObject.types';

export const useBoardSync = (boardId: number) => {
    const navigate = useNavigate();
    const sessionInstanceId = useRef(Date.now().toString());

    // Use our new modular hooks
    const {
        isLoading,
        boardName,
        accessLost,
        objects,
        messages,
        setBoardName,
        setAccessLost,
        setObjects,
        setMessages,
    } = useBoardDataManager(boardId);

    const { isUndoAvailable, isRedoAvailable, handleUndo, handleRedo, resetCounts, incrementUndo } =
        useBoardActions(boardId);

    // Set initial counts when data loads
    useEffect(() => {
        if (!isLoading && objects.length > 0) {
            resetCounts(objects.length);
        }
    }, [isLoading, objects.length, resetCounts]);

    // WebSocket handler
    useBoardWebSocketHandler({
        boardId,
        sessionInstanceId: sessionInstanceId.current,
        setBoardName,
        setAccessLost,
        setObjects,
        setMessages,
    });

    const handleDrawAction = useCallback(
        (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => {
            const newInstanceId = Math.random().toString(36).substring(2);
            const fullPayload = { ...action.payload, instanceId: newInstanceId } as ActionPayload;
            const actionToSend: SendBoardActionRequest = {
                ...action,
                boardId,
                instanceId: newInstanceId,
                sender: sessionInstanceId.current,
            };
            setObjects((prev) => [...prev, fullPayload]);
            incrementUndo();
            websocketService.sendMessage(WEBSOCKET_DESTINATIONS.DRAW_ACTION, actionToSend);
        },
        [boardId, setObjects, incrementUndo]
    );

    useEffect(() => {
        if (accessLost) {
            console.warn(`[useBoardSync] accessLost is true. Navigating to board list...`);
            navigate(APP_ROUTES.BOARD_LIST);
        }
    }, [accessLost, navigate]);

    return {
        isLoading,
        boardName,
        accessLost,
        objects,
        messages,
        instanceId: sessionInstanceId.current,
        isUndoAvailable,
        isRedoAvailable,
        handleDrawAction,
        handleUndo,
        handleRedo,
    };
};
