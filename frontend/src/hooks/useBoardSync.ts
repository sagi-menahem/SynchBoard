// File: frontend/src/hooks/useBoardSync.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import * as boardService from '../services/boardService';
import websocketService from '../services/websocketService';
import { useSocket } from './useSocket';
import { ActionType, type BoardActionResponse, type SendBoardActionRequest, type ActionPayload } from '../types/boardObject.types';
import type { ChatMessageResponse } from '../types/message.types';
import type { Board } from '../types/board.types';
import { WEBSOCKET_DESTINATIONS, WEBSOCKET_TOPICS } from '../constants/api.constants';
import toast from 'react-hot-toast';

export const useBoardSync = (boardId: number) => {
    const sessionInstanceId = useRef(Math.random().toString(36).substring(2)); 
    const [objects, setObjects] = useState<ActionPayload[]>([]);
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [boardDetails, setBoardDetails] = useState<Board | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [undoCount, setUndoCount] = useState(0);
    const [redoCount, setRedoCount] = useState(0);

    useEffect(() => {
        if (isNaN(boardId) || boardId === 0) {
            setIsLoading(false);
            return;
        }
    
        const fetchBoardData = async () => {
            try {
                setIsLoading(true);
                const [objectActions, userBoards] = await Promise.all([
                    boardService.getBoardObjects(boardId),
                    boardService.getBoards()
                ]);
    
                const initialObjects = objectActions
                    .filter(a => a.payload)
                    .map(a => ({ ...(a.payload as object), instanceId: a.instanceId } as ActionPayload));
                setObjects(initialObjects);
                setUndoCount(initialObjects.length); 
                setRedoCount(0); 

                const currentBoard = userBoards.find(board => board.id === boardId);
                if (currentBoard) {
                    setBoardDetails(currentBoard);
                } else {
                    console.error(`Board with ID ${boardId} not found in user's boards.`);
                    toast.error("You do not have access to this board.");
                    setBoardDetails(null);
                }
    
            } catch (error) {
                console.error("Failed to fetch initial board state:", error);
                toast.error("Failed to load board data.");
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchBoardData();

    }, [boardId]);

    const onMessageReceived = useCallback((payload: unknown) => {
        if (typeof payload !== 'object' || !payload) return;

        if ('type' in payload && 'instanceId' in payload) {
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
    }, []);

    useSocket(WEBSOCKET_TOPICS.BOARD(boardId), onMessageReceived);

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

    return {
        isLoading,
        objects,
        messages,
        boardDetails,
        instanceId: sessionInstanceId.current,
        handleDrawAction,
        handleUndo,
        handleRedo, 
        isUndoAvailable: undoCount > 0, 
        isRedoAvailable: redoCount > 0,
    };
};