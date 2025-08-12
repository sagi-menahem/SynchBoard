import { WEBSOCKET_DESTINATIONS } from 'constants';

import React, { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input } from 'components/common';
import { usePreferences } from 'hooks/common';
import websocketService from 'services/WebSocketService';
import type { ChatMessageResponse, SendChatMessageRequest } from 'types/MessageTypes';

import ChatMessage from './ChatMessage';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
    boardId: number;
    messages: ChatMessageResponse[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ boardId, messages }) => {
    const { t } = useTranslation();
    const { preferences } = usePreferences();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    const fontSizeClass = styles[`fontSize-${preferences.fontSizeSetting || 'medium'}`];

    return (
        <div
            className={`${styles.container} ${fontSizeClass}`}
            style={{ backgroundColor: preferences.chatBackgroundSetting || undefined }}
        >
            <div className={styles.messageList}>
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className={styles.form}>
                <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('chatWindow.placeholder')}
                />
                <Button type="submit">{t('common.button.send')}</Button>
            </form>
        </div>
    );
};

export default ChatWindow;
