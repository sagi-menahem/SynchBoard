import React, { useEffect, useRef, useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useAuth } from 'hooks/auth';
import { useChatTransaction } from 'hooks/chat';
import { usePreferences } from 'hooks/common';
import type { ChatMessageResponse } from 'types/MessageTypes';

import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
    boardId: number;
    messages: ChatMessageResponse[];
    /** Function to update the messages state from parent component */
    setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
}

/**
 * Enhanced ChatWindow component with transactional messaging support
 * 
 * Features:
 * - Optimistic message updates (messages appear immediately)
 * - Pending message indicators (visual feedback for unconfirmed messages)
 * - Automatic rollback on connection failures
 * - Robust error handling with user feedback
 */
const ChatWindow: React.FC<ChatWindowProps> = ({ boardId, messages, setMessages }) => {
    const { t } = useTranslation();
    const { preferences } = usePreferences();
    const { userEmail } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(scrollToBottom, [messages, scrollToBottom]);

    // Memoize user info to prevent unnecessary re-renders
    const stableUserInfo = useMemo(() => ({
        userEmail: userEmail || '',
        userFullName: '', // Will be filled by the backend from user profile
        userProfilePictureUrl: undefined,
    }), [userEmail]);

    // Use the chat transaction hook for robust message sending
    const { sendChatMessage, allMessages } = useChatTransaction({
        boardId,
        messages,
        setMessages,
        ...stableUserInfo,
    });

    // Optimized callback for ChatInput component - memoized to prevent re-renders
    const handleSendMessage = useCallback(async (content: string) => {
        if (!boardId) {
            return;
        }

        try {
            // Send message using the transactional hook
            await sendChatMessage(content);
        } catch (error) {
            // Error handling is done by the transaction hook
            // Input will be cleared by ChatInput, failed message will show in chat with indicator
            console.error('Failed to send chat message:', error);
        }
    }, [sendChatMessage, boardId]);

    const fontSizeClass = styles[`fontSize-${preferences.fontSizeSetting || 'medium'}`];

    // Memoize messages to display to prevent unnecessary re-renders
    const messagesToDisplay = useMemo(() => allMessages, [allMessages]);

    return (
        <div
            className={`${styles.container} ${fontSizeClass}`}
            style={{ backgroundColor: preferences.chatBackgroundSetting || undefined }}
        >
            <div className={styles.messageList}>
                {messagesToDisplay.map((msg, index) => {
                    // Type assertion for pending and failed message properties
                    const pendingMsg = msg as ChatMessageResponse & { 
                        isPending?: boolean; 
                        transactionId?: string;
                        isFailed?: boolean;
                    };
                    
                    return (
                        <div 
                            key={pendingMsg.transactionId || `${msg.senderEmail}-${msg.timestamp}-${index}`}
                            className={`${pendingMsg.isPending ? styles.pendingMessage : ''} ${msg.senderEmail === userEmail ? styles.ownMessageContainer : ''}`}
                            style={{
                                opacity: pendingMsg.isPending ? 0.7 : 1,
                                position: 'relative'
                            }}
                        >
                            <ChatMessage 
                                message={msg} 
                                isOwnMessage={msg.senderEmail === userEmail}
                                isFailed={pendingMsg.isFailed}
                            />
                            {pendingMsg.isPending && (
                                <div className={`${styles.pendingIndicator} ${msg.senderEmail === userEmail ? styles.pendingIndicatorOwn : ''}`}>
                                    <span className={styles.pendingIcon}>⏳</span>
                                    <span className={styles.pendingText}>
                                        {t('chat.sending', 'Sending...')}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
            <ChatInput 
                onSendMessage={handleSendMessage}
                placeholder={t('chatWindow.placeholder')}
            />
        </div>
    );
};

export default ChatWindow;