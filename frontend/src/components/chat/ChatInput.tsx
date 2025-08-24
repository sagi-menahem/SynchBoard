import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input } from 'components/common';
import { useConnectionStatus } from 'hooks/common';

import styles from './ChatInput.module.css';

interface ChatInputProps {
    onSendMessage: (content: string) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = React.memo(({ 
  onSendMessage, 
  placeholder, 
}) => {
  const { t } = useTranslation();
  const { shouldBlockFunctionality } = useConnectionStatus();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
        
    const messageContent = message.trim();
    if (!messageContent || shouldBlockFunctionality || isSending) {
      return;
    }

    setIsSending(true);
        
    try {
      await onSendMessage(messageContent);
      setMessage('');
    } catch {
      // Error is already handled by the parent component
      setMessage('');
    } finally {
      setIsSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [message, onSendMessage, shouldBlockFunctionality, isSending]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputContainer}>
        <Input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder={placeholder || t('chatWindow.placeholder', 'Type a message...')}
          disabled={isSending}
          className={isSending ? styles.inputDisabled : ''}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!message.trim() || shouldBlockFunctionality || isSending}
        className={isSending ? styles.buttonSending : ''}
      >
        {isSending ? t('chat.sending', 'Sending...') : t('common.button.send', 'Send')}
      </Button>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;