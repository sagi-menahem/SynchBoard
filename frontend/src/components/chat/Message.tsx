// File: frontend/src/components/chat/Message.tsx
import React from 'react';
import type { ChatMessageResponse } from '../../types/message.types';

interface MessageProps {
    message: ChatMessageResponse;
}

const Message: React.FC<MessageProps> = ({ message }) => {
    return (
        <div style={messageStyle}>
            <strong>{message.sender}: </strong>
            <span>{message.content}</span>
            <span style={timestampStyle}>
                {new Date(message.timestamp).toLocaleTimeString()}
            </span>
        </div>
    );
};

const messageStyle: React.CSSProperties = { marginBottom: '0.5rem' };
const timestampStyle: React.CSSProperties = { fontSize: '0.7rem', color: '#888', marginLeft: '10px' };

export default Message;