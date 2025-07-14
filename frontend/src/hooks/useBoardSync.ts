// File: frontend/src/hooks/useBoardSync.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import * as boardService from '../services/boardService';
import websocketService from '../services/websocketService';
import { useSocket } from './useSocket';
import { ActionType, type BoardActionResponse, type SendBoardActionRequest, type ActionPayload } from '../types/boardObject.types';
import type { ChatMessageResponse } from '../types/message.types';
import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from '../constants/api.constants';
import toast from 'react-hot-toast';

export const useBoardSync = (boardId: number) => {
    // This instanceId is now only for the WebSocket connection session, not for objects.
    const sessionInstanceId = useRef(Math.random().toString(36).substring(2)); 
    const [objects, setObjects] = useState<ActionPayload[]>([]);
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [undoCount, setUndoCount] = useState(0);
    const [redoCount, setRedoCount] = useState(0);

    useEffect(() => {
        if (isNaN(boardId) || boardId === 0) {
            setIsLoading(false);
            return;
        }

        boardService.getBoardObjects(boardId)
            .then(actions => {
                const initialObjects = actions
                    .filter(a => a.payload)
                    .map(a => ({ ...(a.payload as object), instanceId: a.instanceId } as ActionPayload));
                setObjects(initialObjects);
                setUndoCount(initialObjects.length); // Initialize undo count
                setRedoCount(0); // Reset redo count on load
            })
            .catch(error => console.error("Failed to fetch initial board state:", error))
            .finally(() => setIsLoading(false));
    }, [boardId]);

    const onMessageReceived = useCallback((payload: unknown) => {
        if (typeof payload !== 'object' || !payload) return;

        if ('type' in payload && 'instanceId' in payload) {
            const action = payload as BoardActionResponse;
            // The sender check is now the single source of truth to prevent echo.
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
    }, []);

    useSocket(WEBSOCKET_TOPICS.BOARD(boardId), onMessageReceived);

    // =================================================================
    //  UPDATED LOGIC: Generate a unique ID for every single action.
    // =================================================================
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
        setUndoCount(prev => prev + 1); // A new action can be undone
        setRedoCount(0); // A new action clears the redo stack
        
        websocketService.sendMessage(WEBSOCKET_DESTINATIONS.DRAW_ACTION, actionToSend);
    }, [boardId]);
    
const handleUndo = useCallback(async () => {
        if (isLoading || undoCount === 0) {
            toast.error("Nothing to undo.");
            return;
        }
        try {
            await boardService.undoLastAction(boardId);
            // The WebSocket message will trigger the state update for 'objects'
            setUndoCount(prev => prev - 1);
            setRedoCount(prev => prev + 1);
        } catch (error) {
            console.error("Undo failed on the server:", error);
            toast.error("Undo operation failed.");
        }
    }, [boardId, isLoading, undoCount]);

    // NEW: Redo handler function
    const handleRedo = useCallback(async () => {
        if (isLoading || redoCount === 0) {
            toast.error("Nothing to redo.");
            return;
        }
        try {
            await boardService.redoLastAction(boardId);
            // The WebSocket message will trigger the state update for 'objects'
            setUndoCount(prev => prev + 1);
            setRedoCount(prev => prev - 1);
        } catch (error) {
            console.error("Redo failed on the server:", error);
            toast.error("Redo operation failed.");
        }
    }, [boardId, isLoading, redoCount]);

    return {
        isLoading,
        objects,
        messages,
        instanceId: sessionInstanceId.current,
        handleDrawAction,
        handleUndo,
        handleRedo, // Expose redo handler
        isUndoAvailable: undoCount > 0, // Expose availability flags
        isRedoAvailable: redoCount > 0,
    };
};