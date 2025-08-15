import React, { useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input } from 'components/common';

import styles from './ChatInput.module.css';

interface ChatInputProps {
    onSendMessage: (content: string) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
}

/**
 * Optimized ChatInput component that manages its own state
 * to prevent parent re-renders on every keypress
 */
const ChatInput: React.FC<ChatInputProps> = React.memo(({ 
    onSendMessage, 
    disabled = false, 
    placeholder 
}) => {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const messageContent = message.trim();
        if (!messageContent || disabled || isSending) {
            return;
        }

        setIsSending(true);
        
        try {
            await onSendMessage(messageContent);
            // Clear input after successful send initiation
            setMessage('');
        } catch (error) {
            console.error('Failed to send chat message:', error);
            // Input stays cleared even on error as per UX requirements
            setMessage('');
        } finally {
            setIsSending(false);
        }
    }, [message, onSendMessage, disabled, isSending]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    }, []);

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputContainer}>
                <Input
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    placeholder={placeholder || t('chatWindow.placeholder', 'Type a message...')}
                    disabled={disabled || isSending}
                    className={isSending ? styles.inputDisabled : ''}
                />
            </div>
            <Button 
                type="submit" 
                disabled={!message.trim() || disabled || isSending}
                className={isSending ? styles.buttonSending : ''}
            >
                {isSending ? t('chat.sending', 'Sending...') : t('common.button.send', 'Send')}
            </Button>
        </form>
    );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;