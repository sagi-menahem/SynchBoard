import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { isSafeUrl, sanitizeUserContent } from 'utils/Sanitize';

import { API_BASE_URL } from 'constants/ApiConstants';
import type { ChatMessageResponse } from 'types/MessageTypes';

import styles from './ChatMessage.module.css';

interface ChatMessageProps {
    message: ChatMessageResponse;
    isOwnMessage?: boolean;
    isFailed?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage = false, isFailed = false }) => {
    const profileUrl = message.senderProfilePictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${message.senderProfilePictureUrl}`
        : defaultUserImage;

    const imageSource = isSafeUrl(profileUrl) ? profileUrl : defaultUserImage;

    const senderName = sanitizeUserContent(message.senderFullName);
    const messageContent = sanitizeUserContent(message.content);

    return (
        <div className={`${styles.messageContainer} ${isOwnMessage ? styles.ownMessage : ''} ${isFailed ? styles.failedMessage : ''}`}>
            {!isOwnMessage && (
                <img src={imageSource} alt={senderName} className={styles.avatar} />
            )}
            <div className={styles.messageContent}>
                {!isOwnMessage && (
                    <div>
                        <strong>{senderName}</strong>
                        <span className={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                )}
                <span>
                    {messageContent}
                    {isOwnMessage && (
                        <span className={styles.ownTimestamp}>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    )}
                </span>
                {isFailed && (
                    <div className={styles.failedIndicator}>
                        <span className={styles.failedIcon}>❗</span>
                    </div>
                )}
            </div>
        </div>
    );
};

ChatMessage.displayName = 'ChatMessage';

export default React.memo(ChatMessage);
