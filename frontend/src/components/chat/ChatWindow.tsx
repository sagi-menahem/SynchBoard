// File: frontend/src/components/chat/ChatWindow.tsx

import React, { useState } from 'react';
import type { ChatMessageResponse, SendChatMessageRequest } from '../../types/message.types';
import Message from './Message';
import websocketService from '../../services/websocketService';

interface ChatWindowProps {
    boardId: number;
    messages: ChatMessageResponse[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ boardId, messages }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newMessage.trim() && boardId) {
            const request: SendChatMessageRequest = { content: newMessage, boardId: boardId };
            websocketService.sendMessage('/app/chat.sendMessage', request);
            setNewMessage('');
        }
    };

    return (
        <div style={chatContainerStyle}>
            <div style={messageListStyle}>
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
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
    );
};

const chatContainerStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #444', borderRadius: '8px', overflow: 'hidden' };
const messageListStyle: React.CSSProperties = { flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#282828' };
const formStyle: React.CSSProperties = { display: 'flex', padding: '1rem', borderTop: '1px solid #444' };
const inputStyle: React.CSSProperties = { flex: 1, padding: '10px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: '#fff' };
const buttonStyle: React.CSSProperties = { padding: '10px 15px', marginLeft: '10px', border: 'none', borderRadius: '4px', backgroundColor: '#646cff', color: 'white', cursor: 'pointer' };

export default ChatWindow;