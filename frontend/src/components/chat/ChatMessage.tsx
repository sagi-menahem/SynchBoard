import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { isSafeUrl, sanitizeUserContent } from 'utils/sanitize';

import { API_BASE_URL } from 'constants/api.constants';
import type { ChatMessageResponse } from 'types/message.types';

import styles from './ChatMessage.module.css';

interface ChatMessageProps {
    message: ChatMessageResponse;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const profileUrl = message.senderProfilePictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${message.senderProfilePictureUrl}`
        : defaultUserImage;

    const imageSource = isSafeUrl(profileUrl) ? profileUrl : defaultUserImage;

    const senderName = sanitizeUserContent(message.senderFullName);
    const messageContent = sanitizeUserContent(message.content);

    return (
        <div className={styles.messageContainer}>
            <img src={imageSource} alt={senderName} className={styles.avatar} />
            <div className={styles.messageContent}>
                <div>
                    <strong>{senderName}</strong>
                    <span className={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
                <span>{messageContent}</span>
            </div>
        </div>
    );
};

ChatMessage.displayName = 'ChatMessage';

export default React.memo(ChatMessage);
