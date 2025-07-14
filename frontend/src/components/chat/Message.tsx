// File: frontend/src/components/chat/Message.tsx
import React from 'react';
import type { ChatMessageResponse } from '../../types/message.types';
import styles from './Message.module.css';

interface MessageProps {
    message: ChatMessageResponse;
}

const Message: React.FC<MessageProps> = React.memo(({ message }) => {
    return (
        <div className={styles.message}>
            <strong>{message.sender}: </strong>
            <span>{message.content}</span>
            <span className={styles.timestamp}>
                {new Date(message.timestamp).toLocaleTimeString()}
            </span>
        </div>
    );
});

export default Message;