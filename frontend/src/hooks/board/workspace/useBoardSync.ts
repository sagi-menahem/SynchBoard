import { useCallback, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from 'constants/ApiConstants';
import { APP_ROUTES } from 'constants/RoutesConstants';
import { useAuth } from 'hooks/auth/useAuth';
import { useBoardActions } from 'hooks/board/workspace/useBoardActions';
import { useBoardDataManager } from 'hooks/board/workspace/useBoardDataManager';
import { useBoardWebSocketHandler } from 'hooks/board/workspace/useBoardWebSocketHandler';
import { useSocket } from 'hooks/global/useSocket';
import websocketService from 'services/WebSocketService';
import type { ActionPayload, SendBoardActionRequest } from 'types/boardObject.types';
import type { UserUpdateDTO } from 'types/websocket.types';


export const useBoardSync = (boardId: number) => {
    const navigate = useNavigate();
    const sessionInstanceId = useRef(Date.now().toString());
    const { userEmail } = useAuth();

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

    useEffect(() => {
        if (!isLoading && objects.length > 0) {
            resetCounts(objects.length);
        }
    }, [isLoading, objects.length, resetCounts]);

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
            logger.warn(`[useBoardSync] accessLost is true. Navigating to board list...`);
            navigate(APP_ROUTES.BOARD_LIST);
        }
    }, [accessLost, navigate]);

    const handleUserUpdate = useCallback(
        (message: UserUpdateDTO) => {
            logger.debug(`[useBoardSync] Received user update: ${message.updateType}. Navigating to board list...`);
            navigate(APP_ROUTES.BOARD_LIST);
        },
        [navigate]
    );

    useSocket(userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '', handleUserUpdate, 'user');

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
