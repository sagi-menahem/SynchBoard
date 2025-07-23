// File: frontend/src/hooks/useBoardSync.ts
import { AxiosError } from 'axios';
import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from 'constants/api.constants';
import { APP_ROUTES } from 'constants/routes.constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as boardService from 'services/boardService';
import websocketService from 'services/websocketService';
import { ActionType, type ActionPayload, type BoardActionResponse, type SendBoardActionRequest } from 'types/boardObject.types';
import type { ChatMessageResponse } from 'types/message.types';
import type { BoardUpdateDTO } from 'types/websocket.types';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';

export const useBoardSync = (boardId: number) => {
    const { userEmail } = useAuth();
    const navigate = useNavigate();
    const sessionInstanceId = useRef(Date.now().toString());

    const [isLoading, setIsLoading] = useState(true);
    const [boardName, setBoardName] = useState<string | null>(null);
    const [accessLost, setAccessLost] = useState(false);
    const [objects, setObjects] = useState<ActionPayload[]>([]);
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [undoCount, setUndoCount] = useState(0);
    const [redoCount, setRedoCount] = useState(0);

    const fetchInitialData = useCallback(async () => {
        try {
            setIsLoading(true);

            const details = await boardService.getBoardDetails(boardId);
            setBoardName(details.name);

            const [objectActions, messageHistory] = await Promise.all([
                boardService.getBoardObjects(boardId),
                boardService.getBoardMessages(boardId)
            ]);

            const initialObjects = objectActions
                .filter(a => a.payload)
                .map(a => ({ ...(a.payload as object), instanceId: a.instanceId } as ActionPayload));
            setObjects(initialObjects);

            setMessages(messageHistory);

            setUndoCount(initialObjects.length);
            setRedoCount(0);

        } catch (error) {
            console.error("Failed to fetch initial board data:", error);
            if (error instanceof AxiosError && error.response?.status === 403) {
                setAccessLost(true);
            } else {
                toast.error("Failed to load board data.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [boardId]);

    useEffect(() => {
        if (isNaN(boardId) || boardId === 0) {
            setAccessLost(true);
            return;
        }
        fetchInitialData();
    }, [boardId, fetchInitialData]);

    const onMessageReceived = useCallback((payload: unknown) => {
        if (typeof payload !== 'object' || !payload) return;

        if ('updateType' in payload && 'sourceUserEmail' in payload) {
            const update = payload as BoardUpdateDTO;
            if (update.sourceUserEmail === userEmail) return;

            if (update.updateType === 'MEMBERS_UPDATED') {
                boardService.getBoardMessages(boardId).then(setMessages);
            }

            boardService.getBoardDetails(boardId).then(details => {
                setBoardName(details.name);
            }).catch(err => {
                if (err instanceof AxiosError && err.response?.status === 403) {
                    toast.error("You have been removed from this board.");
                    setAccessLost(true);
                }
            });

        } else if ('type' in payload && 'instanceId' in payload) {
            const action = payload as BoardActionResponse;
            if (action.sender === sessionInstanceId.current) return;
            const actionPayload = { ...(action.payload as object), instanceId: action.instanceId } as ActionPayload;
            if (action.type === ActionType.OBJECT_ADD) {
                setObjects(prev => [...prev, actionPayload]);
            } else if (action.type === ActionType.OBJECT_DELETE) {
                setObjects(prev => prev.filter(obj => obj.instanceId !== action.instanceId));
            }
        } else if ('content' in payload && 'senderFullName' in payload) {
            setMessages(prev => [...prev, payload as ChatMessageResponse]);
        }
    }, [boardId, userEmail]);

    useSocket(boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', onMessageReceived);

    const handleDrawAction = useCallback((action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => {
        const newInstanceId = Math.random().toString(36).substring(2);
        const fullPayload = { ...action.payload, instanceId: newInstanceId } as ActionPayload;
        const actionToSend: SendBoardActionRequest = {
            ...action,
            boardId,
            instanceId: newInstanceId,
            sender: sessionInstanceId.current
        };
        setObjects(prev => [...prev, fullPayload]);
        setUndoCount(prev => prev + 1);
        setRedoCount(0);
        websocketService.sendMessage(WEBSOCKET_DESTINATIONS.DRAW_ACTION, actionToSend);
    }, [boardId]);

    const handleUndo = useCallback(async () => {
        if (isLoading || undoCount === 0) {
            toast.error("Nothing to undo.");
            return;
        }
        try {
            await boardService.undoLastAction(boardId);
            setUndoCount(prev => prev - 1);
            setRedoCount(prev => prev + 1);
        } catch (error) {
            console.error("Undo failed on the server:", error);
            toast.error("Undo operation failed.");
        }
    }, [boardId, isLoading, undoCount]);

    const handleRedo = useCallback(async () => {
        if (isLoading || redoCount === 0) {
            toast.error("Nothing to redo.");
            return;
        }
        try {
            await boardService.redoLastAction(boardId);
            setUndoCount(prev => prev + 1);
            setRedoCount(prev => prev - 1);
        } catch (error) {
            console.error("Redo failed on the server:", error);
            toast.error("Redo operation failed.");
        }
    }, [boardId, isLoading, redoCount]);

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
        isUndoAvailable: undoCount > 0,
        isRedoAvailable: redoCount > 0,
        handleDrawAction,
        handleUndo,
        handleRedo,
    };
};