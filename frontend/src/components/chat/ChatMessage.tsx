import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';

import { API_BASE_URL } from 'constants/api.constants';
import type { ChatMessageResponse } from 'types/message.types';

import styles from './ChatMessage.module.css';

interface ChatMessageProps {
    message: ChatMessageResponse;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const imageSource = message.senderProfilePictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${message.senderProfilePictureUrl}`
        : defaultUserImage;

    return (
        <div className={styles.messageContainer}>
            <img src={imageSource} alt={message.senderFullName} className={styles.avatar} />
            <div className={styles.messageContent}>
                <div>
                    <strong>{message.senderFullName}</strong>
                    <span className={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
                <span>{message.content}</span>
            </div>
        </div>
    );
};

ChatMessage.displayName = 'ChatMessage';

export default React.memo(ChatMessage);
