// File: frontend/src/pages/BoardPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import websocketService from '../services/websocketService';
import type { ChatMessageResponse } from '../types/websocket.types';
import type { SendChatMessageRequest } from '../types/websocket.types'; // We need to create this type

// Let's quickly add the SendChatMessageRequest to the types file if it's not there.
// In frontend/src/types/websocket.types.ts, add:
/*
export interface SendChatMessageRequest {
  content: string;
  boardId: number;
}
*/
// Assuming the above type is now created.

const BoardPage: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { token } = useAuth();
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!boardId || !token) return;

        // Function to handle incoming messages
        const onMessageReceived = (payload: ChatMessageResponse) => {
            setMessages(prevMessages => [...prevMessages, payload]);
        };

        // Function to run after connection is established
        const onConnected = () => {
            const topic = `/topic/board/${boardId}`;
            websocketService.subscribe<ChatMessageResponse>(topic, onMessageReceived);

            // TODO: Here we can send a "JOIN" message if we want
        };
        
        // Connect to the WebSocket server
        websocketService.connect(token, onConnected);

        // Cleanup on component unmount
        return () => {
            console.log('Disconnecting from WebSocket...');
            websocketService.disconnect();
        };
    }, [boardId, token]); // Rerun effect if boardId or token changes

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newMessage.trim() && boardId) {
            const request: SendChatMessageRequest = {
                content: newMessage,
                boardId: parseInt(boardId, 10),
            };
            websocketService.sendMessage('/app/chat.sendMessage', request);
            setNewMessage(''); // Clear the input field
        }
    };

    return (
        <div style={pageStyle}>
            <h1>Board Chat (ID: {boardId})</h1>
            
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
    );
};

// Basic inline styles for demonstration
const pageStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '90vh' };
const chatContainerStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #444', borderRadius: '8px', overflow: 'hidden' };
const messageListStyle: React.CSSProperties = { flex: 1, padding: '1rem', overflowY: 'auto' };
const messageStyle: React.CSSProperties = { marginBottom: '0.5rem' };
const timestampStyle: React.CSSProperties = { fontSize: '0.7rem', color: '#888', marginLeft: '10px' };
const formStyle: React.CSSProperties = { display: 'flex', padding: '1rem', borderTop: '1px solid #444' };
const inputStyle: React.CSSProperties = { flex: 1, padding: '10px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: '#fff' };
const buttonStyle: React.CSSProperties = { padding: '10px 15px', marginLeft: '10px', border: 'none', borderRadius: '4px', backgroundColor: '#646cff', color: 'white', cursor: 'pointer' };

export default BoardPage;