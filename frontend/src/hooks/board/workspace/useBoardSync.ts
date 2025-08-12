import { useCallback, useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import logger from 'utils/Logger';

import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from 'constants/ApiConstants';
import { APP_ROUTES } from 'constants/RoutesConstants';
import { useAuth } from 'hooks/auth/useAuth';
import { useBoardActions } from 'hooks/board/workspace/useBoardActions';
import { useBoardDataManager } from 'hooks/board/workspace/useBoardDataManager';
import { useBoardWebSocketHandler } from 'hooks/board/workspace/useBoardWebSocketHandler';
import { useSocket } from 'hooks/global/useSocket';
import websocketService from 'services/WebSocketService';
import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { UserUpdateDTO } from 'types/WebSocketTypes';


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

    // Only reset counts on initial load, not on every object change
    const [hasInitialized, setHasInitialized] = useState(false);
    
    useEffect(() => {
        if (!isLoading && objects.length > 0 && !hasInitialized) {
            resetCounts(objects.length);
            setHasInitialized(true);
        }
    }, [isLoading, objects.length, resetCounts, hasInitialized]);

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
            logger.debug(`[useBoardSync] Received user update: ${message.updateType}.`);
            
            if (message.updateType === 'BOARD_LIST_CHANGED') {
                logger.debug(`[useBoardSync] Board list changed. Navigating to board list...`);
                navigate(APP_ROUTES.BOARD_LIST);
            } else if (message.updateType === 'BOARD_DETAILS_CHANGED') {
                logger.debug(`[useBoardSync] Board details changed. Staying on current page.`);
            }
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
