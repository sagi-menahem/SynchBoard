// File: frontend/src/hooks/useBoardSync.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as boardService from '../services/boardService';
import websocketService from '../services/websocketService';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import { ActionType, type BoardActionResponse, type SendBoardActionRequest, type ActionPayload } from '../types/boardObject.types';
import type { ChatMessageResponse } from '../types/message.types';
import type { BoardUpdateDTO } from '../types/websocket.types';
import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from '../constants/api.constants';
import toast from 'react-hot-toast';
import { APP_ROUTES } from '../constants/routes.constants';
import { AxiosError } from 'axios';

export const useBoardSync = (boardId: number) => {
    // --- DEBUG: Add a render counter to distinguish StrictMode runs ---
    const renderCount = useRef(0);

    console.log(`%c[useBoardSync Hook initialized with boardId: ${boardId}`, 'color: yellow;');

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

    useEffect(() => {
        renderCount.current += 1;
        const instanceId = `Instance ${renderCount.current}`;

        console.log(`[useBoardSync ${instanceId}] useEffect TRIGGERED. boardId: ${boardId}`);
        if (isNaN(boardId) || boardId === 0) {
            console.error(`[useBoardSync ${instanceId}] Invalid boardId (${boardId}). Setting accessLost to true.`);
            setIsLoading(false);
            setAccessLost(true);
            return;
        }

        const fetchInitialData = async () => {
            console.log(`[useBoardSync ${instanceId}] Starting fetchInitialData...`);
            setIsLoading(true);
            console.time(`[useBoardSync ${instanceId}] Total Fetch Time`); // DEBUG: Start timer

            try {
                console.log(`[useBoardSync ${instanceId}] STEP 1: Awaiting boardService.getBoardDetails(${boardId})...`);
                const details = await boardService.getBoardDetails(boardId);
                console.log(`%c[useBoardSync ${instanceId}] STEP 1: getBoardDetails SUCCEEDED.`, 'color: lightgreen;', details);
                setBoardName(details.name);

                console.log(`[useBoardSync ${instanceId}] STEP 2: Awaiting Promise.all for objects and messages...`);
                const [objectActions, messageHistory] = await Promise.all([
                    boardService.getBoardObjects(boardId),
                    boardService.getBoardMessages(boardId)
                ]);
                console.log(`%c[useBoardSync ${instanceId}] STEP 2: Promise.all SUCCEEDED.`, 'color: lightgreen;');

                const initialObjects = objectActions
                    .filter(a => a.payload)
                    .map(a => ({ ...(a.payload as object), instanceId: a.instanceId } as ActionPayload));
                setObjects(initialObjects);

                setMessages(messageHistory);

                setUndoCount(initialObjects.length);
                setRedoCount(0);

            } catch (error) {
                console.error(`%c[useBoardSync ${instanceId}] fetchInitialData FAILED. Full error object:`, 'color: red;', error);
                if (error instanceof AxiosError) {
                    console.error(`[useBoardSync ${instanceId}] Axios error details:`, {
                        message: error.message,
                        status: error.response?.status,
                        url: error.config?.url,
                        method: error.config?.method,
                    });
                    if (error.response?.status === 403) {
                        console.error(`%c[useBoardSync ${instanceId}] CAUGHT 403 FORBIDDEN. Setting accessLost to true.`, 'font-weight: bold; color: red;');
                        setAccessLost(true);
                    }
                } else {
                    toast.error("Failed to load board data.");
                }
            } finally {
                console.timeEnd(`[useBoardSync ${instanceId}] Total Fetch Time`); // DEBUG: End timer
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [boardId]);

    const onMessageReceived = useCallback((payload: unknown) => {
        if (typeof payload !== 'object' || !payload) return;

        if ('updateType' in payload && 'sourceUserEmail' in payload) {
            const update = payload as BoardUpdateDTO;
            if (update.sourceUserEmail === userEmail) return;

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
        } else if ('content' in payload && 'sender' in payload) {
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