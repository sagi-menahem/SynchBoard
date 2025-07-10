// File: frontend/src/pages/BoardPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import websocketService from '../services/websocketService';
import * as boardService from '../services/boardService';
import type { BoardActionResponse, SendBoardActionRequest, ChatMessageResponse, SendChatMessageRequest } from '../types/websocket.types';
import BoardCanvas from '../components/board/BoardCanvas';

const BoardPage: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { isSocketConnected } = useAuth();
    const instanceId = useRef(Math.random().toString(36).substring(2));
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [lastReceivedAction, setLastReceivedAction] = useState<BoardActionResponse | null>(null);
    const [initialObjects, setInitialObjects] = useState<BoardActionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        if (isLoading || !boardId || !isSocketConnected) {
            return;
        }

        const topic = `/topic/board/${boardId}`;
        const onMessageReceived = (payload: unknown) => {
            // Check for BoardActionResponse
            if (typeof payload === 'object' && payload && 'type' in payload && 'sender' in payload && 'payload' in payload) {
                const action = payload as BoardActionResponse;
                
                // THE FIX: We REMOVED the instanceId check.
                // Now we process ALL incoming actions, including our own echo,
                // which acts as confirmation from the server.
                setLastReceivedAction(action);

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
        // We still send the instanceId, it's useful for other potential features
        // but we no longer use it for filtering this specific echo.
        websocketService.sendMessage('/app/board.drawAction', action);
    };

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newMessage.trim() && boardId) {
            const request: SendChatMessageRequest = { content: newMessage, boardId: parseInt(boardId) };
            websocketService.sendMessage('/app/chat.sendMessage', request);
            setNewMessage('');
        }
    };

    if (isLoading) {
        return <div>Loading board...</div>;
    }

    return (
        <div style={pageStyle}>
            <h1>Board Workspace (ID: {boardId})</h1>
            <div style={mainContentStyle}>
                <div style={canvasContainerStyle}>
                    <BoardCanvas 
                        boardId={parseInt(boardId || '0')}
                        instanceId={instanceId.current}
                        onDraw={handleDrawAction}
                        receivedAction={lastReceivedAction}
                        initialObjects={initialObjects}
                    />
                </div>
                <div style={chatContainerStyle}>
                    <div style={messageListStyle}>
                        {messages.map((msg, index) => (
                            <div key={index} style={messageStyle}>
                                <strong>{msg.sender}: </strong>
                                <span>{msg.content}</span>
                                <span style={timestampStyle}>
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} style={formStyle}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            style={inputStyle}
                        />
                        <button type="submit" style={buttonStyle}>Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Styles
const pageStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '90vh', width: '100%' };
const mainContentStyle: React.CSSProperties = { display: 'flex', flex: 1, gap: '1rem', marginTop: '1rem' };
const canvasContainerStyle: React.CSSProperties = { flex: 3 };
const chatContainerStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #444', borderRadius: '8px', overflow: 'hidden' };
const messageListStyle: React.CSSProperties = { flex: 1, padding: '1rem', overflowY: 'auto' };
const messageStyle: React.CSSProperties = { marginBottom: '0.5rem' };
const timestampStyle: React.CSSProperties = { fontSize: '0.7rem', color: '#888', marginLeft: '10px' };
const formStyle: React.CSSProperties = { display: 'flex', padding: '1rem', borderTop: '1px solid #444' };
const inputStyle: React.CSSProperties = { flex: 1, padding: '10px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: '#fff' };
const buttonStyle: React.CSSProperties = { padding: '10px 15px', marginLeft: '10px', border: 'none', borderRadius: '4px', backgroundColor: '#646cff', color: 'white', cursor: 'pointer' };

export default BoardPage;