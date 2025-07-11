// File: frontend/src/pages/BoardPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import websocketService from '../services/websocketService';
import * as boardService from '../services/boardService';
import type { ChatMessageResponse } from '../types/message.types';
import type { BoardActionResponse, SendBoardActionRequest } from '../types/boardObject.types';
import Canvas from '../components/board/Canvas';
import Toolbar from '../components/board/Toolbar';
import ChatWindow from '../components/chat/ChatWindow';

const BoardPage: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { isSocketConnected } = useAuth();
    const instanceId = useRef(Math.random().toString(36).substring(2));
    
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    
    const [lastReceivedAction, setLastReceivedAction] = useState<BoardActionResponse | null>(null);
    const [initialObjects, setInitialObjects] = useState<BoardActionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [tool, setTool] = useState<'brush' | 'eraser' | 'rectangle' | 'circle'>('brush');
    const [strokeColor, setStrokeColor] = useState<string>('#FFFFFF');
    const [strokeWidth, setStrokeWidth] = useState<number>(3);

    useEffect(() => {
        if (!boardId) return;
        const fetchBoardState = async () => {
            try {
                const numericBoardId = parseInt(boardId, 10);
                if (isNaN(numericBoardId)) return;
                const objects = await boardService.getBoardObjects(numericBoardId);
                setInitialObjects(objects);
            } catch (error) {
                console.error("Failed to fetch initial board state:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBoardState();
    }, [boardId]);

    useEffect(() => {
        if (isLoading || !boardId || !isSocketConnected) return;

        const topic = `/topic/board/${boardId}`;
        const onMessageReceived = (payload: unknown) => {
            if (typeof payload === 'object' && payload && 'type' in payload && 'sender' in payload && 'payload' in payload) {
                setLastReceivedAction(payload as BoardActionResponse);
            } else if (typeof payload === 'object' && payload && 'content' in payload && 'sender' in payload) {
                setMessages(prev => [...prev, payload as ChatMessageResponse]);
            }
        };

        const subscription = websocketService.subscribe<unknown>(topic, onMessageReceived);
        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [boardId, isSocketConnected, isLoading]);

    const handleDrawAction = (action: SendBoardActionRequest) => {
        const actionWithInstanceId = { ...action, instanceId: instanceId.current };
        websocketService.sendMessage('/app/board.drawAction', actionWithInstanceId);
    };


    if (isLoading) {
        return <div>Loading board...</div>;
    }

    return (
        <div style={pageStyle}>
            <h1>Board Workspace (ID: {boardId})</h1>
            <Toolbar 
                strokeColor={strokeColor}
                setStrokeColor={setStrokeColor}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
                tool={tool}
                setTool={setTool}
            />
            <div style={mainContentStyle}>
                <div style={canvasContainerStyle}>
                    <Canvas 
                        boardId={parseInt(boardId || '0')}
                        instanceId={instanceId.current}
                        onDraw={handleDrawAction}
                        receivedAction={lastReceivedAction}
                        initialObjects={initialObjects}
                        tool={tool}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <ChatWindow 
                        boardId={parseInt(boardId || '0')}
                        messages={messages} 
                    />
                </div>
            </div>
        </div>
    );
};

const pageStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '90vh', width: '100%' };
const mainContentStyle: React.CSSProperties = { display: 'flex', flex: 1, gap: '1rem', marginTop: '1rem' };
const canvasContainerStyle: React.CSSProperties = { position: 'relative', flex: 3 };

export default BoardPage;