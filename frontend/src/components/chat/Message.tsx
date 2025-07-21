// File: frontend/src/components/chat/Message.tsx
import React from 'react';
import type { ChatMessageResponse } from '../../types/message.types';
import styles from './Message.module.css';
import defaultUserImage from '../../assets/default-user-image.png';
import { API_BASE_URL } from '../../constants/api.constants';

interface MessageProps {
    message: ChatMessageResponse;
}

const Message: React.FC<MessageProps> = React.memo(({ message }) => {
    const imageSource = message.senderProfilePictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${message.senderProfilePictureUrl}`
        : defaultUserImage;

    return (
        <div className={styles.messageContainer}>
            <img src={imageSource} alt={message.senderFullName} className={styles.avatar} />
            <div className={styles.messageContent}>
                <div>
                    <strong>{message.senderFullName}</strong>
                    <span className={styles.timestamp}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                </div>
                <span>{message.content}</span>
            </div>
        </div>
    );
});

export default Message;