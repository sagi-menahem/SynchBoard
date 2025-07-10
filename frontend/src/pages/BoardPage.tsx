// File: frontend/src/pages/BoardPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import websocketService from '../services/websocketService';
import type { StompSubscription } from '@stomp/stompjs'; // Import the subscription type
import type { BoardActionResponse, SendBoardActionRequest, ChatMessageResponse, SendChatMessageRequest } from '../types/websocket.types';
import BoardCanvas from '../components/board/BoardCanvas';

const BoardPage: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { isSocketConnected } = useAuth();
    const instanceId = useRef(Math.random().toString(36).substring(2));
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [lastReceivedAction, setLastReceivedAction] = useState<BoardActionResponse | null>(null);

    useEffect(() => {
        if (!boardId || !isSocketConnected) return;

        let subscription: StompSubscription | null = null;
        const topic = `/topic/board/${boardId}`;

        const onMessageReceived = (payload: unknown) => {
            if (typeof payload === 'object' && payload && 'type' in payload && 'sender' in payload && 'payload' in payload) {
                const action = payload as BoardActionResponse;
                if (action.instanceId !== instanceId.current) {
                    setLastReceivedAction(action);
                }
            } else if (typeof payload === 'object' && payload && 'content' in payload && 'sender' in payload) {
                setMessages(prev => [...prev, payload as ChatMessageResponse]);
            }
        };
        
        // Subscribe and store the subscription object locally in the effect
        subscription = websocketService.subscribe<unknown>(topic, onMessageReceived);

        // The cleanup function now directly uses the subscription object
        return () => {
            if (subscription) {
                console.log(`Unsubscribing from ${topic}`);
                subscription.unsubscribe();
            }
        };
    }, [boardId, isSocketConnected]);

    // ... handleSendMessage and handleDrawAction functions remain the same
    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newMessage.trim() && boardId) {
            const request: SendChatMessageRequest = { content: newMessage, boardId: parseInt(boardId) };
            websocketService.sendMessage('/app/chat.sendMessage', request);
            setNewMessage('');
        }
    };
    const handleDrawAction = (action: SendBoardActionRequest) => {
        // The action object is already complete, just send it.
        websocketService.sendMessage('/app/board.drawAction', action);
    };

    // The JSX remains the same
    return (
        <div style={pageStyle}>
            <h1>Board Workspace (ID: {boardId})</h1>
            <div style={mainContentStyle}>
                <div style={canvasContainerStyle}>
                    <BoardCanvas 
                        boardId={parseInt(boardId || '0')}
                        instanceId={instanceId.current} // <-- Pass the instanceId here
                        onDraw={handleDrawAction}
                        receivedAction={lastReceivedAction}
                    />
                </div>
                <div style={chatContainerStyle}>
                   {/* ... (chat UI remains the same) */}
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