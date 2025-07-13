// File: frontend/src/components/chat/ChatWindow.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessageResponse, SendChatMessageRequest } from '../../types/message.types';
import Message from './Message';
import websocketService from '../../services/websocketService';
import Input from '../common/Input';
import Button from '../common/Button';
import { WEBSOCKET_DESTINATIONS } from '../../constants/api.constants';

interface ChatWindowProps {
    boardId: number;
    messages: ChatMessageResponse[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ boardId, messages }) => {
    const { t } = useTranslation();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newMessage.trim() && boardId) {
            const request: SendChatMessageRequest = { content: newMessage, boardId: boardId };
            websocketService.sendMessage(WEBSOCKET_DESTINATIONS.SEND_MESSAGE, request);
            setNewMessage('');
        }
    };

    return (
        <div style={chatContainerStyle}>
            <div style={messageListStyle}>
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} style={formStyle}>
                <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('chatWindow.placeholder')}
                />
                <Button type="submit" style={{ marginLeft: '10px' }}>{t('common.button.send')}</Button>
            </form>
        </div>
    );
};

const chatContainerStyle: React.CSSProperties = { height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #444', borderRadius: '8px', overflow: 'hidden' };
const messageListStyle: React.CSSProperties = { flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#282828' };
const formStyle: React.CSSProperties = { display: 'flex', padding: '1rem', borderTop: '1px solid #444', backgroundColor: '#2f2f2f' };

export default ChatWindow;