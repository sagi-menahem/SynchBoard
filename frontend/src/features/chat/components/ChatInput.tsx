import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useConnectionStatus } from 'features/websocket/hooks/useConnectionStatus';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'shared/ui';


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
  const { t } = useTranslation(['chat', 'common']);
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
          placeholder={placeholder || t('chat:window.placeholder')}
          disabled={isSending}
          className={isSending ? styles.inputDisabled : ''}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!message.trim() || shouldBlockFunctionality || isSending}
        className={isSending ? styles.buttonSending : ''}
      >
        {isSending ? t('chat:sending') : t('common:button.send')}
      </Button>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;